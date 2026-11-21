#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include "monsvers/battle_engine.hpp"

using namespace emscripten;
using namespace monsvers;

EMSCRIPTEN_BINDINGS(monsvers_engine) {
    enum_<Element>("Element")
        .value("Neutral", Element::Neutral)
        .value("Fire", Element::Fire)
        .value("Water", Element::Water)
        .value("Nature", Element::Nature)
        .value("Electric", Element::Electric)
        .value("Shadow", Element::Shadow);

    value_object<Monster>("Monster")
        .field("id", &Monster::id)
        .field("name", &Monster::name)
        .field("element", &Monster::element)
        .field("level", &Monster::level)
        .field("maxHp", &Monster::max_hp)
        .field("currentHp", &Monster::current_hp)
        .field("attack", &Monster::attack)
        .field("defense", &Monster::defense)
        .field("speed", &Monster::speed);

    value_object<Skill>("Skill")
        .field("id", &Skill::id)
        .field("name", &Skill::name)
        .field("element", &Skill::element)
        .field("power", &Skill::power)
        .field("accuracy", &Skill::accuracy)
        .field("critRatePct", &Skill::crit_rate_pct);

    value_object<DamageReport>("DamageReport")
        .field("damage", &DamageReport::damage)
        .field("elementMultiplier", &DamageReport::element_multiplier)
        .field("stab", &DamageReport::stab)
        .field("critical", &DamageReport::critical)
        .field("targetFainted", &DamageReport::target_fainted)
        .field("targetRemainingHp", &DamageReport::target_remaining_hp);

    function("elementEffectiveness", &BattleEngine::element_effectiveness);
    function("calculateDamage", &BattleEngine::calculate_damage);
}
#endif
