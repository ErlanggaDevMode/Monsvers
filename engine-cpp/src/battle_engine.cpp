#include "monsvers/battle_engine.hpp"

#include <algorithm>
#include <cmath>

namespace monsvers {

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

    const double level_factor = (2.0 * attacker.level) / 5.0 + 2.0;
    const double safe_defense = static_cast<double>(std::max(1, defender.defense));
    const double atk_ratio = static_cast<double>(std::max(1, attacker.attack)) / safe_defense;

    double raw = ((level_factor * skill.power * atk_ratio) / 10.0) + 2.0;
    raw *= report.element_multiplier;
    if (report.stab) raw *= 1.2;
    if (report.critical) raw *= 1.5;

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

}  // namespace monsvers
