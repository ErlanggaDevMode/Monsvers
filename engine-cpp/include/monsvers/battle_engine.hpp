#pragma once

#include "monsvers/types.hpp"

namespace monsvers {

class BattleEngine {
public:
    static double element_effectiveness(Element attack_el, Element defend_el);

    static DamageReport calculate_damage(
        const Monster& attacker,
        const Monster& defender,
        const Skill& skill,
        bool force_crit = false
    );

    static DamageReport apply_attack(
        const Monster& attacker,
        Monster& defender,
        const Skill& skill,
        bool force_crit = false
    );
};

}  // namespace monsvers
