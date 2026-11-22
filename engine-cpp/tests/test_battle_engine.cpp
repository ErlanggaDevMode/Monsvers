#include "monsvers/ai_controller.hpp"
#include "monsvers/battle_engine.hpp"

#include <cassert>
#include <cmath>
#include <iostream>
#include <set>
#include <vector>

using namespace monsvers;

namespace {

Monster make_monster(
    const std::string& id,
    const std::string& name,
    Element el,
    int level = 5,
    int max_hp = 120,
    int max_sp = 40,
    int atk = 28,
    int def = 16,
    int spd = 22
) {
    Monster m{};
    m.id = id;
    m.name = name;
    m.element = el;
    m.level = level;
    m.xp = 0;
    m.max_hp = max_hp;
    m.current_hp = max_hp;
    m.max_sp = max_sp;
    m.current_sp = max_sp;
    m.attack = atk;
    m.defense = def;
    m.speed = spd;
    return m;
}

Skill make_skill(
    const std::string& id,
    const std::string& name,
    Element el,
    int power,
    int sp_cost = 0,
    int accuracy = 100,
    int priority = 0,
    int crit_rate = 10,
    StatusType status = StatusType::None,
    int status_chance = 0,
    int heal_pct = 0
) {
    Skill s{};
    s.id = id;
    s.name = name;
    s.element = el;
    s.power = power;
    s.sp_cost = sp_cost;
    s.accuracy = accuracy;
    s.priority = priority;
    s.crit_rate_pct = crit_rate;
    s.status_effect = status;
    s.status_chance_pct = status_chance;
    s.heal_pct = heal_pct;
    return s;
}

void test_elemental_chart() {
    // Neutral
    assert(BattleEngine::element_effectiveness(Element::Neutral, Element::Fire) == 1.0);
    assert(BattleEngine::element_effectiveness(Element::Neutral, Element::Shadow) == 1.0);
    // Fire
    assert(BattleEngine::element_effectiveness(Element::Fire, Element::Nature) == 1.5);
    assert(BattleEngine::element_effectiveness(Element::Fire, Element::Water) == 0.75);
    assert(BattleEngine::element_effectiveness(Element::Fire, Element::Fire) == 1.0);
    // Water
    assert(BattleEngine::element_effectiveness(Element::Water, Element::Fire) == 1.5);
    assert(BattleEngine::element_effectiveness(Element::Water, Element::Nature) == 0.75);
    assert(BattleEngine::element_effectiveness(Element::Water, Element::Electric) == 0.75);
    // Nature
    assert(BattleEngine::element_effectiveness(Element::Nature, Element::Water) == 1.5);
    assert(BattleEngine::element_effectiveness(Element::Nature, Element::Fire) == 0.75);
    // Electric
    assert(BattleEngine::element_effectiveness(Element::Electric, Element::Water) == 1.5);
    assert(BattleEngine::element_effectiveness(Element::Electric, Element::Nature) == 0.75);
    // Shadow
    assert(BattleEngine::element_effectiveness(Element::Shadow, Element::Shadow) == 1.25);
    assert(BattleEngine::element_effectiveness(Element::Shadow, Element::Fire) == 1.0);
}

void test_legacy_v1_compat() {
    Monster pyro = make_monster("pyro_01", "Pyrofang", Element::Fire, 5, 120, 40, 28, 16, 22);
    Monster leaf = make_monster("leaf_01", "Verdantix", Element::Nature, 5, 110, 40, 22, 18, 19);
    Skill ember = make_skill("ember_claw", "Ember Claw", Element::Fire, 40, 8, 100, 0, 15);

    DamageReport normal = BattleEngine::calculate_damage(pyro, leaf, ember, false);
    DamageReport crit = BattleEngine::calculate_damage(pyro, leaf, ember, true);

    assert(normal.stab);
    assert(normal.element_multiplier == 1.5);
    assert(normal.damage > 0);
    assert(crit.damage > normal.damage);

    DamageReport applied = BattleEngine::apply_attack(pyro, leaf, ember, false);
    assert(leaf.current_hp == applied.target_remaining_hp);
    assert(leaf.current_hp < leaf.max_hp);
}

void test_accuracy_sp_stab_crit_and_support() {
    // Determinism check
    assert(BattleEngine::roll_percent(12345U) == BattleEngine::roll_percent(12345U));
    assert(BattleEngine::roll_percent(0U) >= 0 && BattleEngine::roll_percent(0U) < 100);

    // Insufficient SP fails gracefully
    Monster pyro = make_monster("pyro", "Pyrofang", Element::Fire, 5, 120, 40, 28, 16, 22);
    Monster leaf = make_monster("leaf", "Verdantix", Element::Nature, 5, 120, 40, 22, 18, 19);
    pyro.current_sp = 5;
    Skill expensive = make_skill("inferno", "Inferno", Element::Fire, 60, 12, 100, 0, 0);
    AttackResult no_sp = BattleEngine::resolve_attack(pyro, leaf, expensive, 42U);
    assert(!no_sp.hit);
    assert(no_sp.damage == 0);
    assert(no_sp.attacker_remaining_sp == 5);
    assert(leaf.current_hp == 120);
    assert(!no_sp.note.empty());

    // Accuracy miss (0%) vs hit (100%)
    pyro.current_sp = 40;
    Skill always_miss = make_skill("wild_swing", "Wild Swing", Element::Neutral, 40, 5, 0, 0, 0);
    AttackResult missed = BattleEngine::resolve_attack(pyro, leaf, always_miss, 7U);
    assert(!missed.hit);
    assert(missed.damage == 0);
    assert(pyro.current_sp == 35);
    assert(leaf.current_hp == 120);

    // STAB vs non-STAB (both neutral effectiveness vs Neutral target)
    Monster neutral_def1 = make_monster("peb1", "Pebblit", Element::Neutral, 5, 200, 40, 20, 20, 15);
    Monster neutral_def2 = neutral_def1;
    Skill fire_hit = make_skill("fire_hit", "Fire Hit", Element::Fire, 40, 5, 100, 0, 0);
    Skill water_hit = make_skill("water_hit", "Water Hit", Element::Water, 40, 5, 100, 0, 0);
    AttackResult stab_res = BattleEngine::resolve_attack(pyro, neutral_def1, fire_hit, 10U);
    AttackResult nostab_res = BattleEngine::resolve_attack(pyro, neutral_def2, water_hit, 10U);
    assert(stab_res.hit && stab_res.stab);
    assert(nostab_res.hit && !nostab_res.stab);
    assert(stab_res.damage > nostab_res.damage);

    // Guaranteed Crit (100%) vs 0% Crit
    Monster d_nocrit = make_monster("d1", "Target", Element::Neutral, 5, 200, 40, 20, 20, 15);
    Monster d_crit = d_nocrit;
    Skill no_crit = make_skill("strike", "Strike", Element::Neutral, 40, 0, 100, 0, 0);
    Skill sure_crit = make_skill("snipe", "Snipe", Element::Neutral, 40, 0, 100, 0, 100);
    AttackResult r_norm = BattleEngine::resolve_attack(pyro, d_nocrit, no_crit, 99U);
    AttackResult r_crit = BattleEngine::resolve_attack(pyro, d_crit, sure_crit, 99U);
    assert(!r_norm.critical);
    assert(r_crit.critical);
    assert(r_crit.damage > r_norm.damage);

    // AttackUp (+30% atk) and Shield (-25% dmg)
    Monster buffed = make_monster("b", "Pyrofang", Element::Fire, 5, 120, 40, 30, 16, 22);
    Monster target_plain = make_monster("t1", "Target", Element::Neutral, 5, 300, 40, 20, 20, 15);
    Monster target_shield = target_plain;
    Skill war_cry = make_skill("war_cry", "War Cry", Element::Neutral, 0, 6, 100, 0, 0, StatusType::AttackUp, 100, 0);
    Skill barrier = make_skill("barrier", "Barrier", Element::Neutral, 0, 6, 100, 0, 0, StatusType::Shield, 100, 0);
    Skill recover = make_skill("recover", "Recover", Element::Nature, 0, 8, 100, 0, 0, StatusType::None, 0, 30);

    AttackResult base_hit = BattleEngine::resolve_attack(buffed, target_plain, no_crit, 5U);
    AttackResult buff_res = BattleEngine::resolve_attack(buffed, target_plain, war_cry, 5U);
    assert(buff_res.hit && buff_res.applied_status == StatusType::AttackUp);
    assert(buffed.status == StatusType::AttackUp && buffed.status_turns == 3);

    AttackResult buffed_hit = BattleEngine::resolve_attack(buffed, target_plain, no_crit, 5U);
    assert(buffed_hit.damage > base_hit.damage);

    AttackResult shield_res = BattleEngine::resolve_attack(target_shield, buffed, barrier, 5U);
    assert(shield_res.hit && target_shield.status == StatusType::Shield);
    AttackResult vs_shield = BattleEngine::resolve_attack(buffed, target_shield, no_crit, 5U);
    assert(vs_shield.damage < buffed_hit.damage);

    // Support heal skill
    buffed.current_hp = 50;
    AttackResult heal_res = BattleEngine::resolve_attack(buffed, target_plain, recover, 5U);
    assert(heal_res.hit && heal_res.healed == 36);
    assert(buffed.current_hp == 86 && heal_res.attacker_remaining_hp == 86);
}

void test_guard_and_status_ticks() {
    Monster attacker = make_monster("a", "Pyrofang", Element::Fire, 5, 120, 40, 28, 16, 22);
    Monster def_open = make_monster("d1", "Aquafin", Element::Neutral, 5, 200, 40, 20, 20, 20);
    Monster def_guard = def_open;
    def_guard.current_sp = 25;

    BattleEngine::resolve_guard(def_guard);
    assert(def_guard.guarding);
    assert(def_guard.current_sp == 35);  // +10 SP

    // Cap SP at max_sp
    BattleEngine::resolve_guard(def_guard);
    assert(def_guard.current_sp == 40);

    Skill hit = make_skill("hit", "Hit", Element::Neutral, 50, 0, 100, 0, 0);
    AttackResult r_open = BattleEngine::resolve_attack(attacker, def_open, hit, 1U);
    AttackResult r_guard = BattleEngine::resolve_attack(attacker, def_guard, hit, 1U);
    assert(r_guard.damage < r_open.damage);
    // ~40% reduction
    assert(r_guard.damage <= static_cast<int>(std::ceil(r_open.damage * 0.65)));

    // Burn tick: 10% max_hp, +4 SP regen, expiry when turns reach 0
    Monster burned = make_monster("burn", "Verdantix", Element::Nature, 5, 100, 40, 20, 20, 20);
    burned.current_sp = 20;
    burned.status = StatusType::Burn;
    burned.status_turns = 2;
    StatusTickResult b1 = BattleEngine::process_status_tick(burned, 10U);
    assert(b1.damage == 10);
    assert(b1.remaining_hp == 90);
    assert(b1.remaining_turns == 1);
    assert(!b1.status_expired && !b1.fainted);
    assert(burned.current_sp == 24);

    StatusTickResult b2 = BattleEngine::process_status_tick(burned, 11U);
    assert(b2.damage == 10);
    assert(b2.remaining_hp == 80);
    assert(b2.remaining_turns == 0);
    assert(b2.status_expired);
    assert(burned.status == StatusType::None);
    assert(burned.current_sp == 28);

    // Poison tick: 12% max_hp
    Monster poisoned = make_monster("psn", "Aquafin", Element::Water, 5, 100, 40, 20, 20, 20);
    poisoned.status = StatusType::Poison;
    poisoned.status_turns = 3;
    StatusTickResult p1 = BattleEngine::process_status_tick(poisoned, 20U);
    assert(p1.damage == 12);
    assert(p1.remaining_hp == 88);
    assert(p1.remaining_turns == 2);

    // Paralyze tick: verify both skip and non-skip outcomes exist across seeds
    bool saw_skip = false;
    bool saw_act = false;
    for (uint32_t s = 0; s < 100; ++s) {
        Monster para = make_monster("para", "Sparkit", Element::Electric, 5, 100, 40, 20, 20, 20);
        para.status = StatusType::Paralyze;
        para.status_turns = 2;
        StatusTickResult pr = BattleEngine::process_status_tick(para, s);
        assert(pr.damage == 0);
        if (pr.skipped_turn) saw_skip = true;
        else saw_act = true;
    }
    assert(saw_skip && saw_act);
}

void test_turn_order() {
    // Higher priority always goes first regardless of speed
    assert(BattleEngine::determine_turn_order(10, 1, StatusType::None, 50, 0, StatusType::None) == 1);
    assert(BattleEngine::determine_turn_order(50, 0, StatusType::None, 10, 1, StatusType::None) == 2);

    // Same priority: higher speed wins
    assert(BattleEngine::determine_turn_order(25, 0, StatusType::None, 20, 0, StatusType::None) == 1);
    assert(BattleEngine::determine_turn_order(18, 0, StatusType::None, 24, 0, StatusType::None) == 2);

    // Paralyze halves speed (30 * 0.5 = 15 < 20)
    assert(BattleEngine::determine_turn_order(30, 0, StatusType::Paralyze, 20, 0, StatusType::None) == 2);
    assert(BattleEngine::determine_turn_order(20, 0, StatusType::None, 30, 0, StatusType::Paralyze) == 1);
}

void test_capture_mechanics() {
    Monster full_hp = make_monster("wild", "Sparkit", Element::Electric, 4, 100, 40, 20, 15, 22);
    Monster low_hp = full_hp;
    low_hp.current_hp = 15;

    CaptureResult c_full = BattleEngine::calculate_capture(full_hp, 1.0, 50U);
    CaptureResult c_low = BattleEngine::calculate_capture(low_hp, 1.0, 50U);
    assert(c_low.probability > c_full.probability);

    // Status bonuses: Burn/Poison +15%, Paralyze +25%
    Monster burned = full_hp;
    burned.status = StatusType::Burn;
    Monster paralyzed = full_hp;
    paralyzed.status = StatusType::Paralyze;

    CaptureResult c_burn = BattleEngine::calculate_capture(burned, 1.0, 50U);
    CaptureResult c_para = BattleEngine::calculate_capture(paralyzed, 1.0, 50U);
    assert(std::abs((c_burn.probability - c_full.probability) - 0.15) < 1e-6);
    assert(std::abs((c_para.probability - c_full.probability) - 0.25) < 1e-6);

    // Verify deterministic shakes & catch outcomes across seeds
    bool caught_any = false;
    bool escaped_any = false;
    for (uint32_t s = 0; s < 100; ++s) {
        CaptureResult r = BattleEngine::calculate_capture(low_hp, 1.0, s);
        if (r.caught) {
            assert(r.shakes == 3);
            caught_any = true;
        } else {
            assert(r.shakes >= 0 && r.shakes <= 2);
            escaped_any = true;
        }
    }
    assert(caught_any && escaped_any);
}

void test_xp_and_evolution() {
    Monster pyro = make_monster("pyrofang", "Pyrofang", Element::Fire, 8, 150, 40, 32, 20, 25);
    pyro.evolves_at = 10;
    pyro.evolves_to = "blazefang";

    // Level 8 -> 9 requires 400 XP; Level 9 -> 10 requires 450 XP (total 850 XP).
    // Grant 900 XP: should reach Lv.10 with 50 remaining XP, next_level_xp = 500, and evolve!
    int old_hp = pyro.max_hp;
    int old_atk = pyro.attack;
    LevelUpResult lvl = BattleEngine::grant_xp(pyro, 900);

    assert(lvl.new_level == 10);
    assert(lvl.levels_gained == 2);
    assert(lvl.remaining_xp == 50);
    assert(lvl.next_level_xp == 500);
    assert(lvl.evolved);
    assert(lvl.evolved_to == "blazefang");
    assert(lvl.hp_gain > 0 && lvl.atk_gain > 0 && lvl.def_gain > 0 && lvl.spd_gain > 0);
    assert(pyro.max_hp == old_hp + lvl.hp_gain);
    assert(pyro.attack == old_atk + lvl.atk_gain);
}

void test_ai_tiers() {
    // 1. Wild AI: chooses affordable skills with seeded variation
    Monster wild = make_monster("wild_spark", "Sparkit", Element::Electric, 5, 110, 40, 24, 15, 24);
    Monster player = make_monster("player_aqua", "Aquafin", Element::Water, 5, 120, 40, 25, 18, 20);
    std::vector<Skill> wild_skills = {
        make_skill("quick", "Quick Strike", Element::Neutral, 30, 0, 100, 1, 10),
        make_skill("spark", "Spark Bolt", Element::Electric, 40, 8, 95, 0, 12),
        make_skill("mega", "Overcharge", Element::Electric, 80, 50, 90, 0, 15)  // unaffordable (50 > 40)
    };
    std::set<int> wild_picks;
    for (uint32_t s = 0; s < 40; ++s) {
        int choice = AiController::choose_action(wild, player, wild_skills, AiTier::Wild, s);
        assert(choice == 0 || choice == 1);  // never chooses unaffordable skill 2
        wild_picks.insert(choice);
    }
    assert(wild_picks.size() == 2);  // exhibits randomness across seeds

    // 2. Rival AI: chooses super-effective STAB skill over neutral/resisted, and guards when low SP
    Monster rival = make_monster("rival_pyro", "Pyrofang", Element::Fire, 6, 130, 40, 30, 18, 23);
    Monster leaf_player = make_monster("player_leaf", "Verdantix", Element::Nature, 6, 140, 40, 24, 18, 19);
    std::vector<Skill> rival_skills = {
        make_skill("quick", "Quick Strike", Element::Neutral, 30, 0, 100, 1, 10),
        make_skill("ember", "Ember Claw", Element::Fire, 42, 8, 95, 0, 15),
        make_skill("splash", "Aqua Pulse", Element::Water, 42, 8, 95, 0, 12)
    };
    int rival_pick = AiController::choose_action(rival, leaf_player, rival_skills, AiTier::Rival, 12U);
    assert(rival_pick == 1);  // Ember Claw (Fire vs Nature + STAB)

    // Rival guards on low SP when strong skill is unaffordable and no lethal
    rival.current_sp = 4;
    int rival_guard = AiController::choose_action(rival, leaf_player, rival_skills, AiTier::Rival, 12U);
    assert(rival_guard == -1);

    // Rival punishes lethal HP even at low SP using affordable Quick Strike
    leaf_player.current_hp = 10;
    int rival_lethal = AiController::choose_action(rival, leaf_player, rival_skills, AiTier::Rival, 12U);
    assert(rival_lethal == 0);

    // 3. Boss AI: opens with buff/status in Phase 1, punishes lethal, goes aggressive in Phase 2 (<50% HP)
    Monster boss = make_monster("umbravex", "Umbravex", Element::Shadow, 10, 260, 60, 42, 26, 28);
    Monster hero = make_monster("hero", "Blazefang", Element::Fire, 10, 200, 50, 38, 22, 26);
    std::vector<Skill> boss_skills = {
        make_skill("dark_buff", "Eclipse Aura", Element::Shadow, 0, 10, 100, 0, 0, StatusType::AttackUp, 100, 0),
        make_skill("shadow_claw", "Shadow Claw", Element::Shadow, 48, 10, 95, 0, 15),
        make_skill("void_burst", "Void Burst", Element::Shadow, 65, 16, 95, 0, 20)
    };

    // Phase 1 (100% HP, no buff, healthy player): opens with Eclipse Aura (AttackUp)
    int boss_open = AiController::choose_action(boss, hero, boss_skills, AiTier::Boss, 7U);
    assert(boss_open == 0);

    // Phase 2 (<50% HP): ignores setup buff and unleashes aggressive Void Burst
    boss.current_hp = 100;
    int boss_p2 = AiController::choose_action(boss, hero, boss_skills, AiTier::Boss, 7U);
    assert(boss_p2 == 2);

    // Lethal punishment even in Phase 1
    boss.current_hp = 260;
    hero.current_hp = 20;
    int boss_finish = AiController::choose_action(boss, hero, boss_skills, AiTier::Boss, 7U);
    assert(boss_finish == 1 || boss_finish == 2);
}

Monster make_scaled_monster(
    const std::string& id,
    const std::string& name,
    Element el,
    int level,
    int base_hp,
    int max_sp,
    int base_atk,
    int base_def,
    int base_spd
) {
    const double scale = 1.0 + static_cast<double>(level - 1) * 0.12;
    const int hp = static_cast<int>(std::round(base_hp * scale));
    const int atk = static_cast<int>(std::round(base_atk * scale));
    const int def = static_cast<int>(std::round(base_def * scale));
    const int spd = static_cast<int>(std::round(base_spd * scale));
    return make_monster(id, name, el, level, hp, max_sp, atk, def, spd);
}

struct SimSummary {
    int turns = 0;
    bool player_won = false;
    bool boss_entered_phase2 = false;
    int player_damage_dealt = 0;
    int boss_damage_dealt = 0;
};

SimSummary simulate_boss_battle(
    Monster player,
    const std::vector<Skill>& player_skills,
    Monster boss,
    const std::vector<Skill>& boss_skills,
    uint32_t seed_base
) {
    SimSummary summary{};
    constexpr int kMaxTurns = 40;

    for (int turn = 1; turn <= kMaxTurns && player.current_hp > 0 && boss.current_hp > 0; ++turn) {
        summary.turns = turn;
        player.guarding = false;
        boss.guarding = false;

        if (boss.current_hp * 2 <= boss.max_hp) {
            summary.boss_entered_phase2 = true;
        }

        // Player uses Rival-tier tactical decision making to simulate an engaged player
        const int p_idx = AiController::choose_action(player, boss, player_skills, AiTier::Rival, seed_base + turn * 17U);
        const int b_idx = AiController::choose_action(boss, player, boss_skills, AiTier::Boss, seed_base + turn * 31U);

        const int p_prio = (p_idx >= 0) ? player_skills[p_idx].priority : 2;
        const int b_prio = (b_idx >= 0) ? boss_skills[b_idx].priority : 2;
        const int first = BattleEngine::determine_turn_order(
            player.speed, p_prio, player.status,
            boss.speed, b_prio, boss.status
        );

        auto execute_player = [&](uint32_t seed) {
            if (player.current_hp <= 0 || boss.current_hp <= 0) return;
            if (p_idx < 0) {
                BattleEngine::resolve_guard(player);
            } else {
                AttackResult r = BattleEngine::resolve_attack(player, boss, player_skills[p_idx], seed);
                summary.player_damage_dealt += r.damage;
            }
            if (boss.current_hp * 2 <= boss.max_hp && boss.current_hp > 0) {
                summary.boss_entered_phase2 = true;
            }
        };

        auto execute_boss = [&](uint32_t seed) {
            if (boss.current_hp <= 0 || player.current_hp <= 0) return;
            if (b_idx < 0) {
                BattleEngine::resolve_guard(boss);
            } else {
                AttackResult r = BattleEngine::resolve_attack(boss, player, boss_skills[b_idx], seed);
                summary.boss_damage_dealt += r.damage;
            }
        };

        if (first == 1) {
            execute_player(seed_base + turn * 101U);
            execute_boss(seed_base + turn * 103U);
        } else {
            execute_boss(seed_base + turn * 103U);
            execute_player(seed_base + turn * 101U);
        }

        // End-of-turn status ticks & passive SP regen
        if (player.current_hp > 0 && boss.current_hp > 0) {
            BattleEngine::process_status_tick(player, seed_base + turn * 211U);
        }
        if (boss.current_hp > 0 && player.current_hp > 0) {
            BattleEngine::process_status_tick(boss, seed_base + turn * 223U);
        }

        // Invariant checks every turn
        assert(player.current_hp >= 0 && player.current_hp <= player.max_hp);
        assert(boss.current_hp >= 0 && boss.current_hp <= boss.max_hp);
        assert(player.current_sp >= 0 && player.current_sp <= player.max_sp);
        assert(boss.current_sp >= 0 && boss.current_sp <= boss.max_sp);
    }

    summary.player_won = (player.current_hp > 0 && boss.current_hp == 0);
    return summary;
}

void test_boss_phase2_ai_aggression() {
    // Umbravex Lv.15 vs Blazefang Lv.10
    Monster boss = make_scaled_monster("umbravex", "Umbravex", Element::Shadow, 15, 210, 70, 48, 32, 36);
    Monster player = make_scaled_monster("blazefang", "Blazefang", Element::Fire, 10, 175, 55, 44, 26, 34);

    std::vector<Skill> boss_skills = {
        make_skill("dark_shroud", "Dark Shroud", Element::Shadow, 0, 10, 100, 1, 0, StatusType::Shield, 100, 0),
        make_skill("shadow_claw", "Shadow Claw", Element::Shadow, 45, 8, 95, 0, 18),
        make_skill("void_strike", "Void Strike", Element::Shadow, 70, 15, 90, 0, 20, StatusType::Paralyze, 25, 0),
        make_skill("apex_cataclysm", "Apex Cataclysm", Element::Shadow, 100, 30, 85, 0, 30, StatusType::Paralyze, 40, 0)
    };

    // Phase 1 (>50% HP): healthy boss with no buff sets up Dark Shroud
    boss.current_hp = boss.max_hp;
    int p1_pick = AiController::choose_action(boss, player, boss_skills, AiTier::Boss, 42U);
    assert(p1_pick == 0);

    // Phase 2 (<50% HP): skips defensive setup and unleashes highest-damage Apex Cataclysm
    boss.current_hp = (boss.max_hp / 2) - 1;
    int p2_pick = AiController::choose_action(boss, player, boss_skills, AiTier::Boss, 42U);
    assert(p2_pick == 3);

    // Phase 2 with SP too low for Apex Cataclysm (20 SP): picks Void Strike (power 70) over Shadow Claw (45) & Dark Shroud (0)
    boss.current_sp = 20;
    int p2_mid_sp = AiController::choose_action(boss, player, boss_skills, AiTier::Boss, 42U);
    assert(p2_mid_sp == 2);

    // Phase 2 with low SP (5 SP) and a 0-SP attack available: refuses to guard and stays aggressive
    std::vector<Skill> boss_with_basic = {
        make_skill("quick_strike", "Quick Strike", Element::Neutral, 30, 0, 100, 1, 15),
        make_skill("apex_cataclysm", "Apex Cataclysm", Element::Shadow, 100, 30, 85, 0, 30)
    };
    boss.current_sp = 5;
    int p2_no_guard = AiController::choose_action(boss, player, boss_with_basic, AiTier::Boss, 42U);
    assert(p2_no_guard == 0);

    // Phase 2 lethal punishment: picks reliable priority finisher when player is in lethal range
    player.current_hp = 20;
    boss.current_sp = 70;
    int p2_lethal = AiController::choose_action(boss, player, boss_with_basic, AiTier::Boss, 42U);
    assert(p2_lethal == 0);  // priority + 100% accuracy lethal finisher
}

void test_multiturn_balance_simulations() {
    // 1. Lv.5 Starter (Pyrofang) vs Lv.7 Chapter 1 Boss (Thornback)
    Monster pyro_lv5 = make_scaled_monster("pyrofang", "Pyrofang", Element::Fire, 5, 120, 40, 28, 16, 22);
    std::vector<Skill> pyro_skills = {
        make_skill("ember_claw", "Ember Claw", Element::Fire, 42, 8, 95, 0, 15, StatusType::Burn, 25, 0),
        make_skill("quick_strike", "Quick Strike", Element::Neutral, 30, 0, 100, 1, 15),
        make_skill("flame_burst", "Flame Burst", Element::Fire, 65, 14, 90, 0, 15, StatusType::Burn, 35, 0),
        make_skill("focus_energy", "Focus Energy", Element::Neutral, 0, 8, 100, 0, 0, StatusType::AttackUp, 100, 0)
    };

    Monster thornback_lv7 = make_scaled_monster("thornback", "Thornback", Element::Nature, 7, 160, 50, 32, 28, 14);
    std::vector<Skill> thornback_skills = {
        make_skill("vine_lash", "Vine Lash", Element::Nature, 40, 8, 95, 0, 12, StatusType::Poison, 25, 0),
        make_skill("thorn_barrage", "Thorn Barrage", Element::Nature, 65, 14, 90, 0, 15, StatusType::Poison, 35, 0),
        make_skill("bramble_crush", "Bramble Crush", Element::Nature, 88, 22, 85, 0, 18, StatusType::Poison, 40, 0),
        make_skill("iron_defense", "Iron Defense", Element::Neutral, 0, 8, 100, 1, 0, StatusType::Shield, 100, 0)
    };

    SimSummary ch1 = simulate_boss_battle(pyro_lv5, pyro_skills, thornback_lv7, thornback_skills, 1001U);
    assert(ch1.turns >= 3 && ch1.turns <= 25);
    assert(ch1.player_damage_dealt >= 100 && ch1.boss_damage_dealt >= 100);
    assert(ch1.boss_entered_phase2);  // Lv.5 Fire starter pushes Lv.7 Thornback into Phase 2

    // 2. Lv.10 Evolved (Blazefang) vs Lv.15 Final Boss (Umbravex) balance sanity check
    Monster blaze_lv10 = make_scaled_monster("blazefang", "Blazefang", Element::Fire, 10, 175, 55, 44, 26, 34);
    std::vector<Skill> blaze_skills = {
        make_skill("ember_claw", "Ember Claw", Element::Fire, 42, 8, 95, 0, 15, StatusType::Burn, 25, 0),
        make_skill("flame_burst", "Flame Burst", Element::Fire, 65, 14, 90, 0, 15, StatusType::Burn, 35, 0),
        make_skill("inferno_pillar", "Inferno Pillar", Element::Fire, 90, 24, 85, 0, 20, StatusType::Burn, 45, 0),
        make_skill("cauterize", "Cauterize", Element::Fire, 0, 12, 100, 0, 0, StatusType::None, 0, 35)
    };

    Monster umbravex_lv15 = make_scaled_monster("umbravex", "Umbravex", Element::Shadow, 15, 210, 70, 48, 32, 36);
    std::vector<Skill> umbravex_skills = {
        make_skill("shadow_claw", "Shadow Claw", Element::Shadow, 45, 8, 95, 0, 18),
        make_skill("void_strike", "Void Strike", Element::Shadow, 70, 15, 90, 0, 20, StatusType::Paralyze, 25, 0),
        make_skill("eclipse_abyss", "Eclipse Abyss", Element::Shadow, 92, 24, 85, 0, 24, StatusType::Burn, 30, 0),
        make_skill("apex_cataclysm", "Apex Cataclysm", Element::Shadow, 100, 30, 85, 0, 30, StatusType::Paralyze, 40, 0)
    };

    SimSummary final_boss = simulate_boss_battle(blaze_lv10, blaze_skills, umbravex_lv15, umbravex_skills, 2026U);
    // Final boss fight must be a genuine multi-turn clash (no 1-turn OHKO, no stalemate)
    assert(final_boss.turns >= 2 && final_boss.turns <= 30);
    assert(final_boss.player_damage_dealt > 0);
    assert(final_boss.boss_damage_dealt >= 100);
}

}  // namespace

int main() {
    test_elemental_chart();
    test_legacy_v1_compat();
    test_accuracy_sp_stab_crit_and_support();
    test_guard_and_status_ticks();
    test_turn_order();
    test_capture_mechanics();
    test_xp_and_evolution();
    test_ai_tiers();
    test_boss_phase2_ai_aggression();
    test_multiturn_balance_simulations();

    std::cout << "[OK] All Monsvers BattleEngine v2 & AI Controller native C++ tests passed!\n";
    return 0;
}
