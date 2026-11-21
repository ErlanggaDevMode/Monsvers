#include "monsvers/battle_engine.hpp"

#include <algorithm>
#include <cmath>

namespace monsvers {

namespace {

constexpr int kGuardSpRestore = 10;
constexpr int kTurnSpRegen = 4;
constexpr int kDefaultStatusTurns = 3;

uint32_t splitmix32(uint32_t x) {
    x += 0x9e3779b9U;
    x = (x ^ (x >> 16)) * 0x85ebca6bU;
    x = (x ^ (x >> 13)) * 0xc2b2ae35U;
    return x ^ (x >> 16);
}

bool is_self_buff(StatusType status) {
    return status == StatusType::Shield || status == StatusType::AttackUp;
}

double compute_raw_damage(
    const Monster& attacker,
    const Monster& defender,
    const Skill& skill,
    double element_multiplier,
    bool stab,
    bool critical,
    bool apply_v2_modifiers
) {
    const double level_factor = (2.0 * std::max(1, attacker.level)) / 5.0 + 2.0;
    double effective_attack = static_cast<double>(std::max(1, attacker.attack));
    if (apply_v2_modifiers && attacker.status == StatusType::AttackUp) {
        effective_attack *= 1.30;
    }
    const double safe_defense = static_cast<double>(std::max(1, defender.defense));
    const double atk_ratio = effective_attack / safe_defense;

    double raw = ((level_factor * skill.power * atk_ratio) / 10.0) + 2.0;
    raw *= element_multiplier;
    if (stab) raw *= 1.2;
    if (critical) raw *= 1.5;

    if (apply_v2_modifiers) {
        if (defender.guarding) {
            raw *= 0.60;
        }
        if (defender.status == StatusType::Shield) {
            raw *= 0.75;
        }
    }

    return raw;
}

}  // namespace

double BattleEngine::element_effectiveness(Element attack_el, Element defend_el) {
    if (attack_el == Element::Fire) {
        if (defend_el == Element::Nature) return 1.5;
        if (defend_el == Element::Water) return 0.75;
    } else if (attack_el == Element::Water) {
        if (defend_el == Element::Fire) return 1.5;
        if (defend_el == Element::Nature || defend_el == Element::Electric) return 0.75;
    } else if (attack_el == Element::Nature) {
        if (defend_el == Element::Water) return 1.5;
        if (defend_el == Element::Fire) return 0.75;
    } else if (attack_el == Element::Electric) {
        if (defend_el == Element::Water) return 1.5;
        if (defend_el == Element::Nature) return 0.75;
    } else if (attack_el == Element::Shadow) {
        if (defend_el == Element::Shadow) return 1.25;
    }
    return 1.0;
}

uint32_t BattleEngine::next_random(uint32_t& state) {
    state += 0x9e3779b9U;
    return splitmix32(state);
}

int BattleEngine::roll_percent(uint32_t seed) {
    return static_cast<int>(splitmix32(seed) % 100U);
}

DamageReport BattleEngine::calculate_damage(
    const Monster& attacker,
    const Monster& defender,
    const Skill& skill,
    bool force_crit
) {
    DamageReport report{};
    report.element_multiplier = element_effectiveness(skill.element, defender.element);
    report.stab = (skill.element != Element::Neutral && skill.element == attacker.element);
    report.critical = force_crit;

    const double raw = compute_raw_damage(
        attacker,
        defender,
        skill,
        report.element_multiplier,
        report.stab,
        report.critical,
        false
    );

    report.damage = std::max(1, static_cast<int>(std::round(raw)));
    report.target_remaining_hp = std::max(0, defender.current_hp - report.damage);
    report.target_fainted = (report.target_remaining_hp == 0);
    return report;
}

DamageReport BattleEngine::apply_attack(
    const Monster& attacker,
    Monster& defender,
    const Skill& skill,
    bool force_crit
) {
    DamageReport report = calculate_damage(attacker, defender, skill, force_crit);
    defender.current_hp = report.target_remaining_hp;
    return report;
}

AttackResult BattleEngine::resolve_attack(
    Monster& attacker,
    Monster& defender,
    const Skill& skill,
    uint32_t seed
) {
    AttackResult result{};
    result.target_remaining_hp = defender.current_hp;
    result.attacker_remaining_sp = attacker.current_sp;
    result.attacker_remaining_hp = attacker.current_hp;

    if (attacker.current_hp <= 0) {
        result.hit = false;
        result.note = "Attacker has fainted";
        return result;
    }

    const int cost = std::max(0, skill.sp_cost);
    if (cost > 0 && attacker.current_sp < cost) {
        result.hit = false;
        result.note = "Insufficient SP";
        return result;
    }

    attacker.current_sp = std::max(0, attacker.current_sp - cost);
    attacker.guarding = false;
    result.attacker_remaining_sp = attacker.current_sp;

    uint32_t rng_state = seed;
    const int acc_roll = static_cast<int>(next_random(rng_state) % 100U);
    const int crit_roll = static_cast<int>(next_random(rng_state) % 100U);
    const int status_roll = static_cast<int>(next_random(rng_state) % 100U);

    const int accuracy = std::clamp(skill.accuracy, 0, 100);
    if (acc_roll >= accuracy) {
        result.hit = false;
        result.note = "Attack missed";
        return result;
    }

    result.hit = true;

    // Support / healing / buff / pure-status skills (power <= 0)
    if (skill.power <= 0) {
        if (skill.heal_pct > 0) {
            const int heal_amount = std::max(
                1,
                static_cast<int>(std::round(attacker.max_hp * (skill.heal_pct / 100.0)))
            );
            const int before_hp = attacker.current_hp;
            attacker.current_hp = std::min(attacker.max_hp, attacker.current_hp + heal_amount);
            result.healed = attacker.current_hp - before_hp;
            result.attacker_remaining_hp = attacker.current_hp;
        }

        if (skill.status_effect != StatusType::None) {
            const int chance = (skill.status_chance_pct > 0)
                ? std::clamp(skill.status_chance_pct, 0, 100)
                : 100;
            if (status_roll < chance) {
                if (is_self_buff(skill.status_effect)) {
                    attacker.status = skill.status_effect;
                    attacker.status_turns = kDefaultStatusTurns;
                    result.applied_status = skill.status_effect;
                } else if (defender.current_hp > 0) {
                    defender.status = skill.status_effect;
                    defender.status_turns = kDefaultStatusTurns;
                    result.applied_status = skill.status_effect;
                }
            }
        }

        if (result.healed > 0 && result.applied_status != StatusType::None) {
            result.note = "Healed and applied status";
        } else if (result.healed > 0) {
            result.note = "Healed";
        } else if (result.applied_status == StatusType::Shield) {
            result.note = "Applied Shield";
        } else if (result.applied_status == StatusType::AttackUp) {
            result.note = "Applied AttackUp";
        } else if (result.applied_status != StatusType::None) {
            result.note = "Applied status";
        } else {
            result.note = "Support skill used";
        }
        return result;
    }

    // Damaging attack skills
    result.element_multiplier = element_effectiveness(skill.element, defender.element);
    result.stab = (skill.element != Element::Neutral && skill.element == attacker.element);
    result.critical = (crit_roll < std::clamp(skill.crit_rate_pct, 0, 100));

    const double raw = compute_raw_damage(
        attacker,
        defender,
        skill,
        result.element_multiplier,
        result.stab,
        result.critical,
        true
    );

    result.damage = std::max(1, static_cast<int>(std::round(raw)));
    defender.current_hp = std::max(0, defender.current_hp - result.damage);
    result.target_remaining_hp = defender.current_hp;
    result.target_fainted = (defender.current_hp == 0);

    // Optional self-heal on damaging skills (e.g., drain skills)
    if (skill.heal_pct > 0 && attacker.current_hp > 0) {
        const int heal_amount = std::max(
            1,
            static_cast<int>(std::round(attacker.max_hp * (skill.heal_pct / 100.0)))
        );
        const int before_hp = attacker.current_hp;
        attacker.current_hp = std::min(attacker.max_hp, attacker.current_hp + heal_amount);
        result.healed = attacker.current_hp - before_hp;
        result.attacker_remaining_hp = attacker.current_hp;
    }

    // Secondary status application roll
    if (skill.status_effect != StatusType::None && skill.status_chance_pct > 0) {
        const int chance = std::clamp(skill.status_chance_pct, 0, 100);
        if (status_roll < chance) {
            if (is_self_buff(skill.status_effect)) {
                attacker.status = skill.status_effect;
                attacker.status_turns = kDefaultStatusTurns;
                result.applied_status = skill.status_effect;
            } else if (!result.target_fainted) {
                defender.status = skill.status_effect;
                defender.status_turns = kDefaultStatusTurns;
                result.applied_status = skill.status_effect;
            }
        }
    }

    if (result.critical) {
        result.note = "Critical hit";
    } else if (result.element_multiplier > 1.0) {
        result.note = "Super effective";
    } else if (result.element_multiplier < 1.0) {
        result.note = "Not very effective";
    } else {
        result.note = "Hit";
    }

    return result;
}

void BattleEngine::resolve_guard(Monster& monster) {
    monster.guarding = true;
    monster.current_sp = std::min(monster.max_sp, monster.current_sp + kGuardSpRestore);
}

StatusTickResult BattleEngine::process_status_tick(
    Monster& monster,
    uint32_t seed
) {
    StatusTickResult result{};
    if (monster.current_hp <= 0) {
        result.remaining_hp = 0;
        result.remaining_turns = monster.status_turns;
        result.fainted = true;
        result.note = "Already fainted";
        return result;
    }

    const int safe_max_hp = std::max(1, monster.max_hp);
    switch (monster.status) {
        case StatusType::Burn: {
            const int dmg = std::max(1, static_cast<int>(std::round(safe_max_hp * 0.10)));
            monster.current_hp = std::max(0, monster.current_hp - dmg);
            result.damage = dmg;
            result.note = "Burn dealt damage";
            break;
        }
        case StatusType::Poison: {
            const int dmg = std::max(1, static_cast<int>(std::round(safe_max_hp * 0.12)));
            monster.current_hp = std::max(0, monster.current_hp - dmg);
            result.damage = dmg;
            result.note = "Poison dealt damage";
            break;
        }
        case StatusType::Paralyze: {
            const int roll = roll_percent(seed);
            result.skipped_turn = (roll < 25);
            result.note = result.skipped_turn ? "Paralyzed: skipped turn" : "Paralyzed";
            break;
        }
        case StatusType::Shield:
            result.note = "Shield active";
            break;
        case StatusType::AttackUp:
            result.note = "AttackUp active";
            break;
        case StatusType::None:
        default:
            result.note = "No active status";
            break;
    }

    if (monster.status != StatusType::None) {
        if (monster.status_turns > 0) {
            --monster.status_turns;
        }
        if (monster.status_turns <= 0) {
            monster.status_turns = 0;
            monster.status = StatusType::None;
            result.status_expired = true;
        }
    }

    result.remaining_hp = monster.current_hp;
    result.remaining_turns = monster.status_turns;
    result.fainted = (monster.current_hp <= 0);

    // End-of-turn SP regeneration if alive
    if (!result.fainted) {
        monster.current_sp = std::min(monster.max_sp, monster.current_sp + kTurnSpRegen);
    }

    return result;
}

int BattleEngine::determine_turn_order(
    int m1_speed,
    int m1_priority,
    StatusType m1_status,
    int m2_speed,
    int m2_priority,
    StatusType m2_status
) {
    if (m1_priority != m2_priority) {
        return (m1_priority > m2_priority) ? 1 : 2;
    }

    const double eff1 = (m1_status == StatusType::Paralyze)
        ? (static_cast<double>(m1_speed) * 0.5)
        : static_cast<double>(m1_speed);
    const double eff2 = (m2_status == StatusType::Paralyze)
        ? (static_cast<double>(m2_speed) * 0.5)
        : static_cast<double>(m2_speed);

    return (eff1 >= eff2) ? 1 : 2;
}

CaptureResult BattleEngine::calculate_capture(
    const Monster& target,
    double orb_multiplier,
    uint32_t seed
) {
    CaptureResult result{};
    const int safe_max_hp = std::max(1, target.max_hp);
    const int clamped_hp = std::clamp(target.current_hp, 0, safe_max_hp);
    const double missing_hp_ratio = 1.0 - (static_cast<double>(clamped_hp) / static_cast<double>(safe_max_hp));

    double status_bonus = 0.0;
    if (target.status == StatusType::Burn || target.status == StatusType::Poison) {
        status_bonus = 0.15;
    } else if (target.status == StatusType::Paralyze) {
        status_bonus = 0.25;
    }

    const double base_odds = 0.20 + 0.55 * missing_hp_ratio;
    const double safe_mult = std::max(0.1, orb_multiplier);
    const double probability = std::clamp(base_odds * safe_mult + status_bonus, 0.05, 0.95);

    const double roll = static_cast<double>(roll_percent(seed)) / 100.0;
    result.probability = probability;
    result.caught = (roll < probability);

    if (result.caught) {
        result.shakes = 3;
    } else if (roll < probability + 0.15) {
        result.shakes = 2;
    } else if (roll < probability + 0.35) {
        result.shakes = 1;
    } else {
        result.shakes = 0;
    }

    return result;
}

LevelUpResult BattleEngine::grant_xp(Monster& monster, int xp_gained) {
    LevelUpResult result{};
    monster.level = std::max(1, monster.level);
    const int starting_level = monster.level;
    monster.xp = std::max(0, monster.xp) + std::max(0, xp_gained);

    while (monster.xp >= monster.level * 50) {
        monster.xp -= monster.level * 50;
        ++monster.level;
        ++result.levels_gained;

        const int dh = 12;
        const int da = 3;
        const int dd = 2;
        const int ds = 2;

        monster.max_hp += dh;
        monster.current_hp = std::min(monster.max_hp, monster.current_hp + dh);
        monster.attack += da;
        monster.defense += dd;
        monster.speed += ds;

        result.hp_gain += dh;
        result.atk_gain += da;
        result.def_gain += dd;
        result.spd_gain += ds;
    }

    if (monster.evolves_at > 0 && monster.level >= monster.evolves_at) {
        result.evolved = true;
        result.evolved_to = monster.evolves_to;

        if (starting_level < monster.evolves_at) {
            constexpr int kEvoHp = 20;
            constexpr int kEvoAtk = 6;
            constexpr int kEvoDef = 5;
            constexpr int kEvoSpd = 4;

            monster.max_hp += kEvoHp;
            monster.current_hp = std::min(monster.max_hp, monster.current_hp + kEvoHp);
            monster.attack += kEvoAtk;
            monster.defense += kEvoDef;
            monster.speed += kEvoSpd;

            result.hp_gain += kEvoHp;
            result.atk_gain += kEvoAtk;
            result.def_gain += kEvoDef;
            result.spd_gain += kEvoSpd;
        }
    }

    result.new_level = monster.level;
    result.remaining_xp = monster.xp;
    result.next_level_xp = monster.level * 50;
    return result;
}

}  // namespace monsvers
