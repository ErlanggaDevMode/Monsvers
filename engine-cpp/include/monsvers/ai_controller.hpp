#pragma once

#include <cstdint>
#include <vector>

#include "monsvers/types.hpp"

namespace monsvers {

class AiController {
public:
    // Returns the chosen index in `skills`, or -1 to perform Guard.
    static int choose_action(
        const Monster& enemy,
        const Monster& player,
        const std::vector<Skill>& skills,
        AiTier tier,
        uint32_t seed
    );

private:
    static double estimate_damage(
        const Monster& attacker,
        const Monster& defender,
        const Skill& skill
    );
};

}  // namespace monsvers
