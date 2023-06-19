import * as fs from 'fs';
import { capitalizeString, getLatestFlavorText } from "./utils.js";

/**
 * Get all moves from all pokemons found in the requested region dex with latest flavor text and curated stats.
 * 
 * @param {Pokedex} pokedex 
 * @param {string[]} moves 
 */
export default async function curateMoves(pokedex, moves) {
    console.log("Starting moves data collection!");
    const curatedMoves = [];
  
    for(const move of moves) {
        const newMove = await pokedex.getMoveByName(move);
        const newMoveFlavorText = await getLatestFlavorText(newMove.flavor_text_entries, move);
  
        curatedMoves.push({
            name: newMove.name,
            category: newMove.damage_class.name,
            type: newMove.type.name,
            accuracy: newMove.accuracy ? (6 - Math.floor(newMove.accuracy/20)) + "+" : null,
            power: newMove.power ? Math.max(Math.round(newMove.accuracy/25), 1) : null,
            exertion: getMoveExhaustion(newMove.pp),
            flavorText: newMoveFlavorText.replace("\n", " ")
        });

        console.log(capitalizeString(move) + " move collected!");
    }
  
    // Write file with curated pokemons data and returns all relevant abilities and moves names
    fs.writeFileSync("./collected_data/moves.json", JSON.stringify(curatedMoves));
    console.log("Moves " + curatedMoves.length + " collected!");
}

/**
 * Converts moves PP to value that's more  for me.
 * 
 * @param {number} pp 
 * @returns {number}
 */
function getMoveExhaustion(pp) {
    switch(true) {
        case pp < 10:
            return 3;
      
        case pp < 15:
            return 2;
  
        case pp < 25:
            return 1;
  
        default:
            return 0;
    }
  }