#include "monsvers/battle_engine.hpp"

#include <cassert>
#include <iostream>

using namespace monsvers;

int main() {
    // Elemental advantage checks
    assert(BattleEngine::element_effectiveness(Element::Fire, Element::Nature) == 1.5);
    assert(BattleEngine::element_effectiveness(Element::Fire, Element::Water) == 0.75);
    assert(BattleEngine::element_effectiveness(Element::Water, Element::Fire) == 1.5);
    assert(BattleEngine::element_effectiveness(Element::Electric, Element::Water) == 1.5);

    Monster pyro{"pyro_01", "Pyrofang", Element::Fire, 5, 120, 120, 28, 16, 22};
    Monster leaf{"leaf_01", "Verdantix", Element::Nature, 5, 110, 110, 22, 18, 19};
    Skill ember{"ember_claw", "Ember Claw", Element::Fire, 40, 100, 15};

    DamageReport normal = BattleEngine::calculate_damage(pyro, leaf, ember, false);
    DamageReport crit = BattleEngine::calculate_damage(pyro, leaf, ember, true);

    assert(normal.stab);
    assert(normal.element_multiplier == 1.5);
    assert(normal.damage > 0);
    assert(crit.damage > normal.damage);

    DamageReport applied = BattleEngine::apply_attack(pyro, leaf, ember, false);
    assert(leaf.current_hp == applied.target_remaining_hp);
    assert(leaf.current_hp < leaf.max_hp);

    std::cout << "[OK] BattleEngine native C++ tests passed! (normal="
              << normal.damage << ", crit=" << crit.damage << ")\n";
    return 0;
}
