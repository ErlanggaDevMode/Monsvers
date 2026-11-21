#pragma once

#include <cstdint>

#include "monsvers/types.hpp"

namespace monsvers {

class BattleEngine {
public:
    static double element_effectiveness(Element attack_el, Element defend_el);

    // Deterministic seeded RNG helper returning a reproducible integer in [0, 99].
    static int roll_percent(uint32_t seed);

    // Advances a deterministic PRNG state and returns the mixed 32-bit value.
    static uint32_t next_random(uint32_t& state);

    // Legacy v1 compatibility helpers
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

    // Battle Engine v2 API
    static AttackResult resolve_attack(
        Monster& attacker,
        Monster& defender,
        const Skill& skill,
        uint32_t seed
    );

    static void resolve_guard(Monster& monster);

    static StatusTickResult process_status_tick(
        Monster& monster,
        uint32_t seed
    );

    static int determine_turn_order(
        int m1_speed,
        int m1_priority,
        StatusType m1_status,
        int m2_speed,
        int m2_priority,
        StatusType m2_status
    );

    static CaptureResult calculate_capture(
        const Monster& target,
        double orb_multiplier,
        uint32_t seed
    );

    static LevelUpResult grant_xp(
        Monster& monster,
        int xp_gained
    );
};

}  // namespace monsvers
