const Army = require("../entities/Army");
const Unit = require("../entities/Unit");

class CombatEngine {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Calculate combat outcome between two armies
   */
  async calculateCombatOutcome(attackingArmyId, defendingArmyId) {
    // Fetch armies and their units
    const attacker = await Army.getById(this.dbPool, attackingArmyId);
    const defender = await Army.getById(this.dbPool, defendingArmyId);

    const attackerUnits = await Unit.getByArmyId(this.dbPool, attackingArmyId);
    const defenderUnits = await Unit.getByArmyId(this.dbPool, defendingArmyId);

    // Calculate total attacks and defences
    const attackerAttack = attackerUnits.reduce(
      (sum, u) =>
        sum +
        (u.unit_class.melee_combat || 0) +
        (u.unit_class.ranged_combat || 0),
      0
    );
    const defenderAttack = defenderUnits.reduce(
      (sum, u) =>
        sum +
        (u.unit_class.melee_combat || 0) +
        (u.unit_class.ranged_combat || 0),
      0
    );

    const attackerDefence = attackerUnits.reduce(
      (sum, u) => sum + (u.unit_class.defence || 0),
      0
    );
    const defenderDefence = defenderUnits.reduce(
      (sum, u) => sum + (u.unit_class.defence || 0),
      0
    );

    // Final attack scores
    const attackerFinal = attackerAttack - defenderDefence;
    const defenderFinal = defenderAttack - attackerDefence;

    // Determine winner and loser
    let winner, loser, damage;
    if (attackerFinal > defenderFinal) {
      winner = "attacker";
      loser = defenderUnits;
      damage = attackerFinal - defenderFinal;
    } else if (defenderFinal > attackerFinal) {
      winner = "defender";
      loser = attackerUnits;
      damage = defenderFinal - attackerFinal;
    } else {
      winner = "draw";
      damage = 0;
    }

    // Apply damage to losing army units (lowest HP first)
    if (damage > 0 && winner !== "draw") {
      // Sort units by current hitpoints ascending
      loser.sort((a, b) => a.current_hitpoints - b.current_hitpoints);
      let remainingDamage = damage;
      for (const unit of loser) {
        if (remainingDamage <= 0) break;
        const hpLoss = Math.min(unit.current_hitpoints, remainingDamage);
        await unit.takeDamage(this.dbPool, hpLoss);
        remainingDamage -= hpLoss;
      }
    }

    return {
      winner,
      attackerFinal,
      defenderFinal,
      damage,
    };
  }

  /**
   * Process battle results and update army/unit states
   * This is a placeholder for future combat implementation
   */
  async processBattleResults(battleId, results) {
    try {
      // TODO: Implement battle result processing
      // For now, just log the results
      console.log("Battle results received:", results);
      return {
        success: true,
        message: "Battle results logged (processing not yet implemented)",
      };
    } catch (error) {
      console.error("Error processing battle results:", error);
      throw error;
    }
  }
}

module.exports = CombatEngine;