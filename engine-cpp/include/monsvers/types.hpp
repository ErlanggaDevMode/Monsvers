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

enum class StatusType : int {
    None = 0,
    Burn = 1,
    Poison = 2,
    Paralyze = 3,
    Shield = 4,
    AttackUp = 5
};

enum class AiTier : int {
    Wild = 0,
    Rival = 1,
    Boss = 2
};

struct Monster {
    std::string id;
    std::string name;
    Element element = Element::Neutral;
    int level = 1;
    int xp = 0;
    int max_hp = 100;
    int current_hp = 100;
    int max_sp = 40;
    int current_sp = 40;
    int attack = 20;
    int defense = 10;
    int speed = 15;
    StatusType status = StatusType::None;
    int status_turns = 0;
    bool guarding = false;
    int evolves_at = 0;
    std::string evolves_to;
};

struct Skill {
    std::string id;
    std::string name;
    Element element = Element::Neutral;
    int power = 35;
    int sp_cost = 0;
    int accuracy = 100;
    int priority = 0;
    int crit_rate_pct = 10;
    StatusType status_effect = StatusType::None;
    int status_chance_pct = 0;
    int heal_pct = 0;
};

struct DamageReport {
    int damage = 0;
    double element_multiplier = 1.0;
    bool stab = false;
    bool critical = false;
    bool target_fainted = false;
    int target_remaining_hp = 0;
};

struct AttackResult {
    bool hit = false;
    int damage = 0;
    int healed = 0;
    double element_multiplier = 1.0;
    bool stab = false;
    bool critical = false;
    StatusType applied_status = StatusType::None;
    bool target_fainted = false;
    int target_remaining_hp = 0;
    int attacker_remaining_sp = 0;
    int attacker_remaining_hp = 0;
    std::string note;
};

struct StatusTickResult {
    int damage = 0;
    bool skipped_turn = false;
    bool status_expired = false;
    int remaining_hp = 0;
    int remaining_turns = 0;
    bool fainted = false;
    std::string note;
};

struct CaptureResult {
    bool caught = false;
    double probability = 0.0;
    int shakes = 0;
};

struct LevelUpResult {
    int new_level = 1;
    int remaining_xp = 0;
    int next_level_xp = 50;
    int levels_gained = 0;
    bool evolved = false;
    std::string evolved_to;
    int hp_gain = 0;
    int atk_gain = 0;
    int def_gain = 0;
    int spd_gain = 0;
};

}  // namespace monsvers
