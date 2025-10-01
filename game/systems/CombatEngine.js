import Army from '../entities/Army.js';
import Unit from '../entities/Unit.js';

class CombatEngine {
    constructor(dbPool) {
        this.dbPool = dbPool;
    }

    /**
     * Calculate combat outcome between two armies
     */
    async calculateCombatOutcome(attackingArmy, defendingArmy) {
        try {
            const calculateTotals = (army) => {
                const totalMelee = army.reduce((sum, unit) => sum + unit.melee_combat, 0);
                const totalRanged = army.reduce((sum, unit) => sum + unit.ranged_combat, 0);
                const totalDefense = army.reduce((sum, unit) => sum + unit.defense, 0);
                return { totalAttack: totalMelee + totalRanged, totalDefense };
            };

            const attackerTotals = calculateTotals(attackingArmy);
            const defenderTotals = calculateTotals(defendingArmy);

            const finalAttack1 = Math.max(0, attackerTotals.totalAttack - defenderTotals.totalDefense);
            const finalAttack2 = Math.max(0, defenderTotals.totalAttack - attackerTotals.totalDefense);

            let winner, loser, damage;

            if (finalAttack1 > finalAttack2) {
                winner = 'attacker';
                loser = defendingArmy;
                damage = finalAttack1 - finalAttack2;
            } else if (finalAttack2 > finalAttack1) {
                winner = 'defender';
                loser = attackingArmy;
                damage = finalAttack2 - finalAttack1;
            } else {
                return {
                    winner: 'draw',
                    message: "It's a draw!",
                    updatedAttackingArmy: attackingArmy,
                    updatedDefendingArmy: defendingArmy
                };
            }

            // Apply damage to the losing army
            loser.sort((a, b) => a.hp - b.hp); // Sort units by HP (ascending)
            for (const unit of loser) {
                if (damage <= 0) break;
                if (unit.hp <= damage) {
                    damage -= unit.hp;
                    unit.hp = 0;
                } else {
                    unit.hp -= damage;
                    damage = 0;
                }
            }

            return {
                winner,
                message: `${winner === 'attacker' ? 'Attacking army' : 'Defending army'} wins!`,
                updatedAttackingArmy: attackingArmy,
                updatedDefendingArmy: defendingArmy
            };
        } catch (error) {
            console.error('Error calculating combat outcome:', error);
            throw error;
        }
    }

    /**
     * Process battle results and update army/unit states
     */
    async processBattleResults(battleId, results) {
        try {
            // TODO: Implement battle result processing
            console.log('Battle results received:', results);
            return {
                success: true,
                message: 'Battle results logged (processing not yet implemented)'
            };
        } catch (error) {
            console.error('Error processing battle results:', error);
            throw error;
        }
    }
}

module.exports = CombatEngine;
