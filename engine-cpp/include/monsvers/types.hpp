#pragma once

#include <cstdint>
#include <string>

namespace monsvers {

enum class Element : int {
    Neutral = 0,
    Fire = 1,
    Water = 2,
    Nature = 3,
    Electric = 4,
    Shadow = 5
};

struct Monster {
    std::string id;
    std::string name;
    Element element = Element::Neutral;
    int level = 1;
    int max_hp = 100;
    int current_hp = 100;
    int attack = 20;
    int defense = 10;
    int speed = 15;
};

struct Skill {
    std::string id;
    std::string name;
    Element element = Element::Neutral;
    int power = 35;
    int accuracy = 100;
    int crit_rate_pct = 10;
};

struct DamageReport {
    int damage = 0;
    double element_multiplier = 1.0;
    bool stab = false;
    bool critical = false;
    bool target_fainted = false;
    int target_remaining_hp = 0;
};

}  // namespace monsvers
