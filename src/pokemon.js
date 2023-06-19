// Pokemon data gathering methods

import * as fs from 'fs';
import { capitalizeString } from "./utils.js";

/**
 * This will get all pokemon from the specified region's pokedex with latest possible game info.
 * 
 * Reponse: Object{ abilities: string[], moves: string[] }
 * 
 * @param {Pokedex} pokedex 
 * @param {string} regionDex 
 * @returns {Reponse}
 */
export default async function curatePokemon(pokedex, regionDex) {
    console.log("Starting pokemon data collection!");
    const curatedPokemons = [];
    const abilities = [];
    const moves = [];
    
    const searchDex = await pokedex.getPokedexByName(regionDex);
    for(const entry of searchDex.pokemon_entries) {
        const pokemon = await pokedex.getPokemonByName(entry.pokemon_species.name);
        const pokemonLatestGameVersion = await getPokemonLatestMoveSetVersion(pokemon.name, pokemon.moves);
        const pokemonAbilities = [];
        const pokemonMoves = [];
  
        for(const move of pokemon.moves) {
            // Checks if pokemons learns move in the desired game version and how
            const moveGameVersion = move.version_group_details.find((version) => version.version_group.name == pokemonLatestGameVersion);
            if(moveGameVersion) {
                pokemonMoves.push({
                    name: move.move.name,
                    learningMethod: moveGameVersion.move_learn_method.name,
                });
  
                // Get relevant moves names
                const isMoveAlreadyCollected = moves.find((collectedMove) => collectedMove == move.move.name);
                if(!isMoveAlreadyCollected) {
                    moves.push(move.move.name);
                }
            }
        }
  
        for(const ability of pokemon.abilities) {
            pokemonAbilities.push(ability.ability.name)
    
            // Get relevant abilities names
            const isAbilityAlreadyCollected = abilities.find((collectedAbility) => collectedAbility == ability.ability.name);
            if(!isAbilityAlreadyCollected) {
                abilities.push(ability.ability.name);
            }
        }
    
        // Pokemon data collector
            curatedPokemons.push({
            name: pokemon.name,
            primaryType: pokemon.types[0].type.name,
            secondaryType: pokemon.types.length > 1 ? pokemon.types[1].type.name : "",
            abilities: pokemonAbilities,
            hitpoints: Math.max(Math.round(pokemon.stats[0].base_stat/10), 1),
            attack: Math.max(Math.round(pokemon.stats[1].base_stat/20), 1),
            defense: Math.max(Math.round(pokemon.stats[2].base_stat/20), 1),
            specialAttack: Math.max(Math.round(pokemon.stats[3].base_stat/20), 1),
            specialDefense: Math.max(Math.round(pokemon.stats[4].base_stat/20), 1),
            speed: Math.max(Math.round(pokemon.stats[5].base_stat/20), 1),
            moves: pokemonMoves,
        });

        console.log(capitalizeString(pokemon.name) + " collected!")
    }
  
    // Write file with curated pokemons data and returns all relevant abilities and moves names
    fs.writeFileSync("./collected_data/pokemons.json", JSON.stringify(curatedPokemons));
    console.log("Pokemons " + curatedPokemons.length + " collected!");
    return {
      abilities: abilities,
      moves: moves,
    };
}

/**
 * Tries to find which vertsion the requested pokémon move set is the latest, moves object expects to be a
 * move endpoint from a pokemon using pokedex-promise-v2.
 * 
 * If no version is found, process will shut down as it's intended to sinalize that I need to find the next 
 * possible version and add to the switch case.
 * 
 * @param {string} pokemonName 
 * @param {object} moves 
 * @returns string
 */
async function getPokemonLatestMoveSetVersion(pokemonName, moves) {
    for(const move of moves) {
        switch(true) {
            case move.version_group_details.find((version) => version.version_group.name == "scarlet-violet") !=  undefined:
                return "scarlet-violet";
    
            case move.version_group_details.find((version) => version.version_group.name == "sword-shield") != undefined:
                return "sword-shield";
    
            case move.version_group_details.find((version) => version.version_group.name == "brilliant-diamond-and-shining-pearl") != undefined:
                return "brilliant-diamond-and-shining-pearl";
    
            case move.version_group_details.find((version) => version.version_group.name == "lets-go-pikachu-lets-go-eevee") != undefined:
                return "lets-go-pikachu-lets-go-eevee";
        }
    }
    
    console.log("No game version with " + capitalizeString(pokemonName) + " moves! :(");
    process.exit();
}
