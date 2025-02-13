import * as fs from 'fs';
import { getLatestFlavorText } from "./utils.js";

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
            type: newMove.type.name,
            category: newMove.damage_class.name,
            accuracy: newMove.accuracy ? Math.floor(newMove.accuracy/10) : null,
            power: newMove.power ? Math.max(Math.round(newMove.power/20), 1) : null,
            exertion: 4 - Math.ceil(newMove.pp/10),
            flavorText: newMoveFlavorText.replaceAll("\n", " "),
        });
    }
  
    // Write file with curated pokemons data and returns all relevant abilities and moves names
    fs.writeFileSync("./collected_data/moves.json", JSON.stringify(curatedMoves));
    console.log(curatedMoves.length + " moves collected!");
}

/**
 * Converts moves PP to value for a smaller value called exhaustation, the higher the velue, more taxing it 
 * is for a pokémon to perform.
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