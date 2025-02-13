import * as fs from 'fs';
import { getLatestFlavorText } from "./utils.js";

/**
 * Get all abilities from all pokemons found in the requested region dex with latest flavor text.
 * 
 * @param {Pokedex} pokedex 
 * @param {string[]} abilities 
 */
export default async function curateAbilities(pokedex, abilities) {
    console.log("Starting abilities data collection!");
    const curatedAbilities = [];
  
    for(const ability of abilities) {
        const newAbility = await pokedex.getAbilityByName(ability);
        const newAbilityFlavorText = await getLatestFlavorText(newAbility.flavor_text_entries, ability);
  
        curatedAbilities.push({
            name: newAbility.name,
            flavorText: newAbilityFlavorText ? newAbilityFlavorText.replaceAll("\n", " ") : "",
        });
    }
  
    // Writes curated abilities file
    fs.writeFileSync("./collected_data/abilities.json", JSON.stringify(curatedAbilities));
    console.log(curatedAbilities.length + " abilities collected!");
}