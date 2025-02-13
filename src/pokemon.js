// Pokemon data gathering methods

import * as fs from 'fs';
import { capitalizeString } from "./utils.js";

const SUPPORTED_ALTERNATE_FORMS = [
    // Regional
    "-alola",
    "-galar",
    "-hisui",
    "-paldea",

    // Special
    "-mega",
    "-primal",
    "-origin",
    "-zen",
    "-therian",
    "-black",
    "-white",
    "-crowned",

    // Oricorio, all it's forms are desired
    "oricorio",

    // Rockruff own tempo
    "rockruff-own-tempo",

    // Lycanroc, all it's forms are desired
    "lycanroc",

    // Wishiwashi school form
    "wishiwashi-school",

    // Basculin, all it's forms are desired
    "basculin",

    // Castform, all it's forms are desired
    "castform",

    // Zygarde, all it's forms are desired
    "zygarde",

    // Necrozma, all it's forms are desired
    "necrozma",

    // Deoxys, all it's forms are desired
    "deoxys",

    // Wormadam, all it's forms are desired
    "wormadam",

    // Eotom, all it's forms are desired
    "rotom",

    // Shaymin Sky form
    "shaymin-sky",

    // Meloetta-pirouette form
    "meloetta-pirouette",

    // Greninja-battle bond form
    "greninja-battle-bond",

    // Meowstic, all it's forms are desired
    "meowstic",

    // Aegislash-blade form
    "aegislash-blade",

    // Pumpkaboo, all it's forms are desired
    "pumpkaboo",

    // Gourgeist, all it's forms are desired
    "gourgeist",

    // Hoopa unbound form
    "hoopa-unbound",

    // Cramorant gulping form
    "gulping",

    // Toxtricity low key form
    "toxtricity-low-key",

    // eiscue noice form
    "eiscue-noice",

    // Indeedee female form
    "indeedee-female",

    // Morpeko hangry form
    "morpeko-hangry",

    // Eternatus eternamax form
    "eternatus-eternamax",

    // Urshifu rapid strike form
    "urshifu-rapid-strike",

    // Calyrex, all it's forms are desired
    "calyrex",

    // Basculegion female form
    "basculegion-female",

    // Oinkologne female form
    "oinkologne-female",

    // Squawkabilly, all it's forms are desired
    "squawkabilly",

    // Palafin hero form
    "palafin-hero",

    // Tatsugiri, all it's forms are desired
    "tatsugiri",

    // Gimmighoul roaming form
    "gimmighoul-roaming",
];

const EXCLUEDED_ALTERNATE_FORMS = [
    // Special
    "totem",
    "gmax",
    "-starter",
    "power-construct",
    "-mega",

    // Pikachu none of it's alternate forms are desired
    "pikachu-",

    // Floeete eternal is not desired
    "floette-eternal",

    // Minior none of it's alternate forms are desired
    "minior-",

    // Magearna original is not desired
    "magearna-original",

    // Keldeo resolute is not desired
    "keldeo-resolute",

    // Greninja-ash is not desired
    "greninja-ash",

    // Mimikyu busted is not desired
    "mimikyu-busted",

    // Cramorant gorging is not desired
    "cramorant-gorging",

    // Cramorant gorging is not desired
    "zarude-dada",

    // maushold family of three is not desired
    "maushold-family-of-three",

    // Dudunsparce three segment is not desired
    "dudunsparce-three-segment",

    // Koraidon none of it's alternate forms are desired
    "koraidon-",

    // Miraidon none of it's alternate forms are desired
    "miraidon-",
];

const MOVE_SET_GAME_VERSION = [
    "scarlet-violet",
    "brilliant-diamond-and-shining-pearl",
    "sword-shield",
    "lets-go-pikachu-lets-go-eevee",
    "ultra-sun-ultra-moon",
];

const MOVE_SET_GAME_VERSION_COUNTER = {
    scarletviolet: 0,
    brilliantdiamondandshiningpearl: 0,
    swordshield: 0,
    letsgopikachuletsgoeevee: 0,
    ultrasunultramoon: 0,
};

const extraAbilitiesPokemon = [
    // Greninja battle bond ability
    "greninja-battle-bond",

    // Rockruff own tempo ability
    "rockruff-own-tempo",
];

/**
 * This will get all pokemon from the specified region's pokedex with latest possible game info.
 * 
 * Reponse: Object{ abilitiesNames: string[], movesNames: string[] }
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
        const pokemonSpecies = await pokedex.getPokemonSpeciesByName(entry.pokemon_species.name);
        for(const pokemonForm of pokemonSpecies.varieties) {
            if(pokemonForm.is_default == true || isPokemonFormSupported(pokemonForm.pokemon.name)) {
                const pokemon = await pokedex.getPokemonByName(pokemonForm.pokemon.name);
                const pokemonLatestGameVersion = await getPokemonLatestMoveSetVersion(pokemon.name, pokemon.moves);
                const pokemonAbilities = [];
                const pokemonMoves = [];
  
                for(const ability of pokemon.abilities) {
                    pokemonAbilities.push(ability.ability.name);
        
                    // Get relevant abilities names
                    const isAbilityAlreadyCollected = abilities.find((collectedAbility) => collectedAbility ==  ability.ability.name);
                    if(!isAbilityAlreadyCollected) {
                        abilities.push(ability.ability.name);
                    }
                }
  
                // Checks if pokemon is one of those with 4 abilities
                if(extraAbilitiesPokemon.includes(pokemon.name)) {
                    const pokemonName = pokemon.name.split("-");
                    const pokemonIndex = curatedPokemons.findIndex((pokemon) => pokemon.name == pokemonName[0]);
                    curatedPokemons[pokemonIndex].abilities.push(pokemonAbilities[0]);
                } else {
                    for(const move of pokemon.moves) {
                        // Checks if pokemons learns move in the desired game version and how
                        const moveGameVersion = move.version_group_details.find((version) => version.version_group. name == pokemonLatestGameVersion);
                        const validMoves = ["level-up", "egg"];
                        if(moveGameVersion && validMoves.includes(moveGameVersion.move_learn_method.name)) {
                            pokemonMoves.push(move.move.name);
          
                            // Get relevant moves names
                            const isMoveAlreadyCollected = moves.find((collectedMove) => collectedMove == move.move.name);
                            if(!isMoveAlreadyCollected) {
                                moves.push(move.move.name);
                            }
                        }
                    }
                    
                    // Get pokemons it eveolcer from
                    let preEvolutions = [];
                    if(pokemonSpecies.evolves_from_species) {
                        const preEvolutionSpecies = await pokedex.getPokemonSpeciesByName(pokemonSpecies.evolves_from_species.name);
                        preEvolutions = preEvolutions.concat(preEvolutionSpecies.varieties
                            .filter((unfiltredPreEvolution) => !isPokemonFormExcluded(unfiltredPreEvolution.pokemon.name))
                            .map((filtredPreEvolution) => filtredPreEvolution.pokemon.name));
                    }

                    // Pokemon data collector
                    curatedPokemons.push({
                        name: pokemon.name,
                        primaryType: pokemon.types[0].type.name,
                        secondaryType: pokemon.types.length > 1 ? pokemon.types[1].type.name : "",
                        abilities: pokemonAbilities,
                        weight: getWeightStatCategory(pokemon.weight/10),
                        height: getHeightCategory(pokemon.height/10),
                        stats: pokemonStatHandler(pokemon.stats),
                        preEvolutions: preEvolutions,
                        moves: pokemonMoves,
                    });
                }
            }
        }
    }
  
    // Write file with curated pokemons data and returns all relevant abilities and moves names
    console.log(curatedPokemons.length + " pokemons collected!");
    console.log("Move set counter by version:");
    console.log(MOVE_SET_GAME_VERSION_COUNTER);
    fs.writeFileSync("./collected_data/pokemons.json", JSON.stringify(curatedPokemons));
    
    return {
      abilities: abilities,
      moves: moves,
    };
}

/**
 * Checks if pokemon's form is valid for collection.
 * 
 * It's expect to receive the unformated pokemon form name.
 * 
 * @param {string} pokemonForm 
 * @returns {boolean}
 */
function isPokemonFormSupported(pokemonForm) {
    if(!isPokemonFormExcluded(pokemonForm)) {
        for(const supportedForm of SUPPORTED_ALTERNATE_FORMS) {
            if(pokemonForm.includes(supportedForm)) {
                return true;
            }
        }
        console.log(capitalizeString(pokemonForm) + " alterned from is not supported! :(")
    }
    return false
}

/**
 * Checks if pokemon's form is not desired for collection.
 * 
 * It's expect to receive the unformated pokemon form name.
 * 
 * @param {string} pokemonForm 
 * @returns {boolean}
 */
function isPokemonFormExcluded(pokemonForm) {
    for(const excludedForm of EXCLUEDED_ALTERNATE_FORMS) {
        if(pokemonForm.includes(excludedForm)) {
            return true;
        }
    }

    return false
}

/**
 * Tries to find which version the requested pokémons latest move set, moves object expects to be a
 * move endpoint from a pokemon using pokedex-promise-v2.
 * 
 * @param {string} pokemonName 
 * @param {object} moves 
 * @returns string
 */
async function getPokemonLatestMoveSetVersion(pokemonName, moves) {
    for(const move of moves) {
        for(const gameVersion of MOVE_SET_GAME_VERSION) {
            const isMoveInGameVersion = move.version_group_details.find((version) => version.version_group.name == gameVersion);
            if(isMoveInGameVersion) {
                MOVE_SET_GAME_VERSION_COUNTER[gameVersion.replaceAll("-", "")] += 1;
                return gameVersion;
            }
        }
    }
    
    // Code to be uncommented when API data is updated
    //console.log("No game version with " + capitalizeString(pokemonName) + " moves! :(");
    //process.exit();
}

/**
 * Handles the stats object array in a pokemon endpoint and calculates them to be smaller, as 3 digit values
 * not easily used in a tebletop format.
 * 
 * @param {array} stats 
 * @returns {object}
 */
function pokemonStatHandler(stats) {
    const handledStats= {
        hp: getWeightStatCategory(stats[0].base_stat),
        st: getWeightStatCategory(stats[1].base_stat),
        to: getWeightStatCategory(stats[2].base_stat),
        in: getWeightStatCategory(stats[3].base_stat),
        sp: getWeightStatCategory(stats[4].base_stat),
        ag: getWeightStatCategory(stats[5].base_stat),
    };

    return handledStats;
}

/**
 * Gets pokemon's weight or stat category.
 * 
 * @param {number} weightStat 
 * @returns {number}
 */
function getWeightStatCategory(weightStat) {
    switch(true) {
        case weightStat < 10:
            return 1;
            
        case weightStat < 30:
            return 2;
            
        case weightStat < 60:
            return 3;
            
        case weightStat < 100:
            return 4;
            
        case weightStat < 150:
            return 5;
            
        case weightStat < 210:
            return 6;
            
        case weightStat < 280:
            return 7;
            
        case weightStat < 370:
            return 8;
            
        case weightStat < 470:
            return 9;
        
        default:
            return 10;
    }
}


/**
 * Gets pokemon's height category.
 * 
 * @param {number} height 
 * @returns {number}
 */
function getHeightCategory(height) {
    switch(true) {
        case height <= 0.5:
            return 1;
            
        case height < 1:
            return 2;
            
        case height < 2:
            return 3;
            
        case height < 4:
            return 4;
            
        case height < 7:
            return 5;
            
        case height < 11:
            return 6;
            
        case height < 16:
            return 7;
            
        case height < 22:
            return 8;
            
        case height < 29:
            return 9;
        
        default:
            return 10;
    }
}