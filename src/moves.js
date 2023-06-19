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
            accuracy: newMove.accuracy ? (6 - Math.floor(newMove.accuracy/20)) : null,
            power: newMove.power ? Math.max(Math.round(newMove.accuracy/25), 1) : null,
            exertion: getMoveExhaustion(newMove.pp),
            effectFlags: moveEffectFlagsHandler(newMove.meta, newMove.statChanges),
            flavorText: newMoveFlavorText.replace("\n", " "),
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

function moveEffectFlagsHandler(meta, statChanges) {
    const effectFlags = [];

    if(meta.ailment.name != "none") {
        effectFlags.push({
            name: meta.ailment.name,
            chance: 6 - Math.floor(meta.ailment_chance/20),
        });
    }

    if(meta.crit_rate != 0) {
        effectFlags.push({
            name: "crit",
            strength: meta.crit_rate,
        });
    }

    if(meta.drain != 0){
        effectFlags.push({
            name: "drain",
            strength: Math.ceil(meta.drain/20),
        });
    }

    if(meta.flinch_chance != 0){
        effectFlags.push({
            name: "flinch",
            chance: 6 - Math.floor(meta.ailment_chance/20),
        });
    }

    if(meta.heal != 0){
        effectFlags.push({
            name: "heal",
            strength: Math.ceil(meta.drain/20),
        });
    }

    return effectFlags;
}