#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>

#include <cstdint>
#include <vector>

#include "monsvers/ai_controller.hpp"
#include "monsvers/battle_engine.hpp"

using namespace emscripten;
using namespace monsvers;

namespace {

AttackResult resolve_attack_wasm(
    Monster attacker,
    Monster defender,
    const Skill& skill,
    uint32_t seed
) {
    return BattleEngine::resolve_attack(attacker, defender, skill, seed);
}

Monster resolve_guard_wasm(Monster monster) {
    BattleEngine::resolve_guard(monster);
    return monster;
}

StatusTickResult process_status_tick_wasm(Monster monster, uint32_t seed) {
    return BattleEngine::process_status_tick(monster, seed);
}

LevelUpResult grant_xp_wasm(Monster monster, int xp_gained) {
    return BattleEngine::grant_xp(monster, xp_gained);
}

int choose_enemy_skill_wasm(
    const Monster& enemy,
    const Monster& player,
    const std::vector<Skill>& skills,
    AiTier tier,
    uint32_t seed
) {
    return AiController::choose_action(enemy, player, skills, tier, seed);
}

}  // namespace

EMSCRIPTEN_BINDINGS(monsvers_engine) {
    enum_<Element>("Element", enum_value_type::number)
        .value("Neutral", Element::Neutral)
        .value("Fire", Element::Fire)
        .value("Water", Element::Water)
        .value("Nature", Element::Nature)
        .value("Electric", Element::Electric)
        .value("Shadow", Element::Shadow);

    enum_<StatusType>("StatusType", enum_value_type::number)
        .value("None", StatusType::None)
        .value("Burn", StatusType::Burn)
        .value("Poison", StatusType::Poison)
        .value("Paralyze", StatusType::Paralyze)
        .value("Shield", StatusType::Shield)
        .value("AttackUp", StatusType::AttackUp);

    enum_<AiTier>("AiTier", enum_value_type::number)
        .value("Wild", AiTier::Wild)
        .value("Rival", AiTier::Rival)
        .value("Boss", AiTier::Boss);

    value_object<Monster>("Monster")
        .field("id", &Monster::id)
        .field("name", &Monster::name)
        .field("element", &Monster::element)
        .field("level", &Monster::level)
        .field("xp", &Monster::xp)
        .field("maxHp", &Monster::max_hp)
        .field("currentHp", &Monster::current_hp)
        .field("maxSp", &Monster::max_sp)
        .field("currentSp", &Monster::current_sp)
        .field("attack", &Monster::attack)
        .field("defense", &Monster::defense)
        .field("speed", &Monster::speed)
        .field("status", &Monster::status)
        .field("statusTurns", &Monster::status_turns)
        .field("guarding", &Monster::guarding)
        .field("evolvesAt", &Monster::evolves_at)
        .field("evolvesTo", &Monster::evolves_to);

    value_object<Skill>("Skill")
        .field("id", &Skill::id)
        .field("name", &Skill::name)
        .field("element", &Skill::element)
        .field("power", &Skill::power)
        .field("spCost", &Skill::sp_cost)
        .field("accuracy", &Skill::accuracy)
        .field("priority", &Skill::priority)
        .field("critRatePct", &Skill::crit_rate_pct)
        .field("statusEffect", &Skill::status_effect)
        .field("statusChancePct", &Skill::status_chance_pct)
        .field("healPct", &Skill::heal_pct);

    value_object<DamageReport>("DamageReport")
        .field("damage", &DamageReport::damage)
        .field("elementMultiplier", &DamageReport::element_multiplier)
        .field("stab", &DamageReport::stab)
        .field("critical", &DamageReport::critical)
        .field("targetFainted", &DamageReport::target_fainted)
        .field("targetRemainingHp", &DamageReport::target_remaining_hp);

    value_object<AttackResult>("AttackResult")
        .field("hit", &AttackResult::hit)
        .field("damage", &AttackResult::damage)
        .field("healed", &AttackResult::healed)
        .field("elementMultiplier", &AttackResult::element_multiplier)
        .field("stab", &AttackResult::stab)
        .field("critical", &AttackResult::critical)
        .field("appliedStatus", &AttackResult::applied_status)
        .field("targetFainted", &AttackResult::target_fainted)
        .field("targetRemainingHp", &AttackResult::target_remaining_hp)
        .field("attackerRemainingSp", &AttackResult::attacker_remaining_sp)
        .field("attackerRemainingHp", &AttackResult::attacker_remaining_hp)
        .field("note", &AttackResult::note);

    value_object<StatusTickResult>("StatusTickResult")
        .field("damage", &StatusTickResult::damage)
        .field("skippedTurn", &StatusTickResult::skipped_turn)
        .field("statusExpired", &StatusTickResult::status_expired)
        .field("remainingHp", &StatusTickResult::remaining_hp)
        .field("remainingTurns", &StatusTickResult::remaining_turns)
        .field("fainted", &StatusTickResult::fainted)
        .field("note", &StatusTickResult::note);

    value_object<CaptureResult>("CaptureResult")
        .field("caught", &CaptureResult::caught)
        .field("probability", &CaptureResult::probability)
        .field("shakes", &CaptureResult::shakes);

    value_object<LevelUpResult>("LevelUpResult")
        .field("newLevel", &LevelUpResult::new_level)
        .field("remainingXp", &LevelUpResult::remaining_xp)
        .field("nextLevelXp", &LevelUpResult::next_level_xp)
        .field("levelsGained", &LevelUpResult::levels_gained)
        .field("evolved", &LevelUpResult::evolved)
        .field("evolvedTo", &LevelUpResult::evolved_to)
        .field("hpGain", &LevelUpResult::hp_gain)
        .field("atkGain", &LevelUpResult::atk_gain)
        .field("defGain", &LevelUpResult::def_gain)
        .field("spdGain", &LevelUpResult::spd_gain);

    register_vector<Skill>("SkillList");

    // Existing v1 compatibility bindings
    function("elementEffectiveness", &BattleEngine::element_effectiveness);
    function("calculateDamage", &BattleEngine::calculate_damage);

    // Battle Engine v2 & AI bindings
    function("resolveAttack", &resolve_attack_wasm);
    function("resolveGuard", &resolve_guard_wasm);
    function("processStatusTick", &process_status_tick_wasm);
    function("determineTurnOrder", &BattleEngine::determine_turn_order);
    function("calculateCapture", &BattleEngine::calculate_capture);
    function("grantXp", &grant_xp_wasm);
    function("chooseEnemySkill", &choose_enemy_skill_wasm);
}
#endif
