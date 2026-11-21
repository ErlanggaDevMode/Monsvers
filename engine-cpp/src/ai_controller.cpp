#include "monsvers/ai_controller.hpp"

#include <algorithm>
#include <cmath>
#include <limits>
#include <vector>

#include "monsvers/battle_engine.hpp"

namespace monsvers {

double AiController::estimate_damage(
    const Monster& attacker,
    const Monster& defender,
    const Skill& skill
) {
    if (skill.power <= 0) {
        return 0.0;
    }

    const double level_factor = (2.0 * std::max(1, attacker.level)) / 5.0 + 2.0;
    double eff_atk = static_cast<double>(std::max(1, attacker.attack));
    if (attacker.status == StatusType::AttackUp) {
        eff_atk *= 1.30;
    }
    const double safe_def = static_cast<double>(std::max(1, defender.defense));
    double raw = ((level_factor * skill.power * (eff_atk / safe_def)) / 10.0) + 2.0;

    raw *= BattleEngine::element_effectiveness(skill.element, defender.element);
    if (skill.element != Element::Neutral && skill.element == attacker.element) {
        raw *= 1.2;
    }
    if (defender.guarding) {
        raw *= 0.60;
    }
    if (defender.status == StatusType::Shield) {
        raw *= 0.75;
    }
    return std::max(1.0, raw);
}

int AiController::choose_action(
    const Monster& enemy,
    const Monster& player,
    const std::vector<Skill>& skills,
    AiTier tier,
    uint32_t seed
) {
    if (skills.empty()) {
        return -1;
    }

    std::vector<int> affordable;
    affordable.reserve(skills.size());
    int best_unaffordable_power = 0;

    for (int i = 0; i < static_cast<int>(skills.size()); ++i) {
        if (skills[i].sp_cost <= enemy.current_sp) {
            affordable.push_back(i);
        } else {
            best_unaffordable_power = std::max(best_unaffordable_power, skills[i].power);
        }
    }

    if (affordable.empty()) {
        return -1;
    }

    uint32_t rng = seed;

    // ------------------------------------------------------------------
    // Tier 0: Wild — prefers affordable skills with slight randomness
    // ------------------------------------------------------------------
    if (tier == AiTier::Wild) {
        const int roll = static_cast<int>(BattleEngine::next_random(rng) % 100U);
        // Occasionally pick any affordable skill randomly for natural wild variety
        if (roll < 35) {
            const int pick = static_cast<int>(BattleEngine::next_random(rng) % affordable.size());
            return affordable[pick];
        }

        int best_idx = affordable[0];
        double best_score = -std::numeric_limits<double>::infinity();
        for (int idx : affordable) {
            const Skill& s = skills[idx];
            double score = 0.0;
            if (s.power > 0) {
                score = estimate_damage(enemy, player, s) * (std::clamp(s.accuracy, 1, 100) / 100.0);
            } else if (s.heal_pct > 0 && enemy.current_hp * 2 < enemy.max_hp) {
                score = 22.0;
            } else if (s.status_effect != StatusType::None) {
                score = 12.0;
            }
            // Add slight seeded jitter (+/- 15%)
            const int jitter_roll = static_cast<int>(BattleEngine::next_random(rng) % 31U) - 15;
            score *= (1.0 + static_cast<double>(jitter_roll) / 100.0);
            if (score > best_score) {
                best_score = score;
                best_idx = idx;
            }
        }
        return best_idx;
    }

    // Helper: check for a reliable lethal finish among affordable skills
    int lethal_idx = -1;
    double best_lethal_score = -std::numeric_limits<double>::infinity();
    int best_affordable_power = 0;

    for (int idx : affordable) {
        const Skill& s = skills[idx];
        best_affordable_power = std::max(best_affordable_power, s.power);
        if (s.power > 0) {
            const double dmg = estimate_damage(enemy, player, s);
            if (dmg >= static_cast<double>(player.current_hp) && s.accuracy >= 70) {
                const double lethal_score =
                    (s.priority * 100.0) + static_cast<double>(s.accuracy) * 2.0 + dmg * 0.1;
                if (lethal_score > best_lethal_score) {
                    best_lethal_score = lethal_score;
                    lethal_idx = idx;
                }
            }
        }
    }

    // Both Rival and Boss immediately punish lethal HP
    if (lethal_idx >= 0) {
        return lethal_idx;
    }

    // ------------------------------------------------------------------
    // Tier 1: Rival — expected damage (element + STAB + lethal), guards on low SP
    // ------------------------------------------------------------------
    if (tier == AiTier::Rival) {
        const int low_sp_threshold = std::max(6, enemy.max_sp / 5);
        if (enemy.current_sp <= low_sp_threshold && best_unaffordable_power > best_affordable_power) {
            return -1;
        }

        int best_idx = affordable[0];
        double best_score = -std::numeric_limits<double>::infinity();
        for (int idx : affordable) {
            const Skill& s = skills[idx];
            double score = 0.0;
            if (s.power > 0) {
                const double eff = BattleEngine::element_effectiveness(s.element, player.element);
                const bool stab = (s.element != Element::Neutral && s.element == enemy.element);
                const double expected = estimate_damage(enemy, player, s) * (std::clamp(s.accuracy, 1, 100) / 100.0);
                score = expected;
                if (eff > 1.0) score += 8.0;
                if (eff < 1.0) score -= 5.0;
                if (stab) score += 4.0;
                if (s.status_effect != StatusType::None && player.status == StatusType::None) {
                    score += (s.status_chance_pct / 100.0) * 8.0;
                }
            } else {
                if (s.heal_pct > 0 && enemy.current_hp < enemy.max_hp * 0.40) {
                    score = 32.0 + s.heal_pct * 0.3;
                } else if (s.status_effect == StatusType::AttackUp && enemy.status == StatusType::None) {
                    score = 18.0;
                } else if (s.status_effect == StatusType::Shield && enemy.status == StatusType::None &&
                           enemy.current_hp < enemy.max_hp * 0.65) {
                    score = 16.0;
                } else if ((s.status_effect == StatusType::Burn ||
                            s.status_effect == StatusType::Poison ||
                            s.status_effect == StatusType::Paralyze) &&
                           player.status == StatusType::None) {
                    score = 18.0;
                } else {
                    score = -10.0;
                }
            }

            // Tiny deterministic tie-breaker
            score += static_cast<double>(BattleEngine::next_random(rng) % 100U) * 0.001;
            if (score > best_score) {
                best_score = score;
                best_idx = idx;
            }
        }
        return best_idx;
    }

    // ------------------------------------------------------------------
    // Tier 2: Boss — opens with status/buff when advantageous, punishes lethal,
    //                increases aggression below 50% HP (Phase 2)
    // ------------------------------------------------------------------
    const bool phase2 = (enemy.current_hp * 2 <= enemy.max_hp);
    const double player_hp_ratio = static_cast<double>(player.current_hp) /
                                   static_cast<double>(std::max(1, player.max_hp));
    const double enemy_hp_ratio = static_cast<double>(enemy.current_hp) /
                                  static_cast<double>(std::max(1, enemy.max_hp));

    // Guard to recharge SP if starved for signature skills (less willing to guard in Phase 2)
    if (enemy.current_sp < 8 && best_unaffordable_power > best_affordable_power + 10) {
        if (!phase2 || best_affordable_power == 0) {
            return -1;
        }
    }

    // Compute baseline best expected damage so Boss buff/status valuation scales with level
    double best_expected_dmg = 0.0;
    for (int idx : affordable) {
        const Skill& s = skills[idx];
        if (s.power > 0) {
            const double expected = estimate_damage(enemy, player, s) *
                                    (std::clamp(s.accuracy, 1, 100) / 100.0);
            best_expected_dmg = std::max(best_expected_dmg, expected);
        }
    }

    int best_idx = affordable[0];
    double best_score = -std::numeric_limits<double>::infinity();

    for (int idx : affordable) {
        const Skill& s = skills[idx];
        double score = 0.0;

        if (s.power > 0) {
            const double eff = BattleEngine::element_effectiveness(s.element, player.element);
            const bool stab = (s.element != Element::Neutral && s.element == enemy.element);
            const double expected = estimate_damage(enemy, player, s) * (std::clamp(s.accuracy, 1, 100) / 100.0);

            // Phase 2 ramps up offensive aggression significantly
            const double aggression = phase2 ? 1.50 : 1.0;
            score = expected * aggression;

            if (eff > 1.0) score += phase2 ? 18.0 : 12.0;
            if (eff < 1.0) score -= 6.0;
            if (stab) score += 6.0;
            if (phase2 && s.power >= 45) {
                score += 18.0;
            }
            if (s.priority > 0 && player_hp_ratio < 0.35) {
                score += 15.0;
            }
            if (s.status_effect != StatusType::None) {
                const bool is_buff = (s.status_effect == StatusType::Shield ||
                                      s.status_effect == StatusType::AttackUp);
                if (is_buff && enemy.status == StatusType::None) {
                    score += (s.status_chance_pct / 100.0) * 14.0;
                } else if (!is_buff && player.status == StatusType::None) {
                    score += (s.status_chance_pct / 100.0) * 14.0;
                }
            }
        } else {
            // Support / buff / debuff scoring (scales with attack strength across all levels)
            const double baseline = std::max(30.0, best_expected_dmg);
            if (!phase2) {
                // Phase 1: strongly favor opening with buff or debilitating status while healthy
                if (s.status_effect == StatusType::AttackUp && enemy.status == StatusType::None &&
                    player_hp_ratio > 0.45) {
                    score = baseline * 1.40 + 25.0;
                } else if (s.status_effect == StatusType::Shield && enemy.status == StatusType::None &&
                           player_hp_ratio > 0.45) {
                    score = baseline * 1.25 + 20.0;
                } else if ((s.status_effect == StatusType::Burn ||
                            s.status_effect == StatusType::Poison ||
                            s.status_effect == StatusType::Paralyze) &&
                           player.status == StatusType::None &&
                           player_hp_ratio > 0.45) {
                    score = baseline * 1.30 + 22.0;
                } else if (s.heal_pct > 0 && enemy_hp_ratio < 0.65) {
                    score = baseline * 1.10 + 15.0;
                } else {
                    score = -20.0;
                }
            } else {
                // Phase 2 (<50% HP): prioritize all-out aggression over setup buffs
                if (s.heal_pct > 0 && enemy_hp_ratio < 0.20) {
                    score = baseline * 0.90;
                } else if (s.status_effect == StatusType::AttackUp && enemy.status == StatusType::None) {
                    score = baseline * 0.35;
                } else {
                    score = -25.0;
                }
            }
        }

        score += static_cast<double>(BattleEngine::next_random(rng) % 100U) * 0.001;
        if (score > best_score) {
            best_score = score;
            best_idx = idx;
        }
    }

    return best_idx;
}

}  // namespace monsvers
