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
 * Reponse: Object{ abilities: string[], moves: string[] }
 * 
 * @param {Pokedex} pokedex 
 * @param {string} regionDex 
 * @returns {Reponse}
 */
export default async function curatePokemon(pokedex, regionDex) {
    console.log("Starting pokemon data collection!");
    const curatedPokemons = [];
    const unsupportedPokemons = [];
    const abilities = [];
    const moves = [];
    
    const searchDex = await pokedex.getPokedexByName(regionDex);
    for(const entry of searchDex.pokemon_entries) {
        const pokemonSpecies = await pokedex.getPokemonSpeciesByName(entry.pokemon_species.name);
        for(const pokemonForm of pokemonSpecies.varieties) {
            if(pokemonForm.is_default == true || isPokemonFormSupported(pokemonForm.pokemon.name, unsupportedPokemons)) {
                const pokemon = await pokedex.getPokemonByName(pokemonForm.pokemon.name);
                const pokemonLatestGameVersion = await getPokemonLatestMoveSetVersion(pokemon.name, pokemon.moves);
                const pokemonAbilities = [];
                const pokemonMoves = [];
  
                for(const ability of pokemon.abilities) {
                    pokemonAbilities.push({
                        name: ability.ability.name,
                        slot: ability.slot,
                    });
        
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
                        if(moveGameVersion) {
                            pokemonMoves.push({
                                name: move.move.name,
                                learningCost: getLearningCost(moveGameVersion),
                            });
          
                            // Get relevant moves names
                            const isMoveAlreadyCollected = moves.find((collectedMove) => collectedMove == move.move.name);
                            if(!isMoveAlreadyCollected) {
                                moves.push(move.move.name);
                            }
                        }
                    }
    
                    // Pokemon data collector
                    curatedPokemons.push({
                        name: pokemon.name,
                        primaryType: pokemon.types[0].type.name,
                        secondaryType: pokemon.types.length > 1 ? pokemon.types[1].type.name : "",
                        abilities: pokemonAbilities,
                        stats: pokemonStatHandler(pokemon.stats),
                        moves: pokemonMoves,
                    });
                }
            }
        }
    }
  
    // Write file with curated pokemons data and returns all relevant abilities and moves names
    console.log(curatedPokemons.length + " pokemons collected!");
    console.log("Move counter by version:");
    console.log(MOVE_SET_GAME_VERSION_COUNTER);
    fs.writeFileSync("./collected_data/pokemons.json", JSON.stringify(curatedPokemons));
    fs.writeFileSync("./collected_data/unhandledPokemons.json", JSON.stringify(unsupportedPokemons));
    
    return {
      abilities: abilities,
      moves: moves,
    };
}

/**
 * Checks if pokemon's aesired form is valid for collection.
 * 
 * It's expect to receive the unformated pokemon form name.
 * 
 * @param {string} pokemonForm 
 * @returns {boolean}
 */
function isPokemonFormSupported(pokemonForm, unsupportedPokemons) {
    if(!isPokemonFormExcluded(pokemonForm)) {
        for(const supportedForm of SUPPORTED_ALTERNATE_FORMS) {
            if(pokemonForm.includes(supportedForm)) {
                return true;
            }
        }

        unsupportedPokemons.push(pokemonForm);
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
 * Handles the stats object array in a pokemon endpoint and handle into a stats object more suited for me.
 * 
 * 
 * @param {array} stats 
 * @returns {object}
 */
function pokemonStatHandler(stats) {
    const handledStats= {
        hitPoints: {
            base: Math.max(Math.round(stats[0].base_stat/10), 1),
        },
        attack: {
            base: Math.max(Math.round(stats[1].base_stat/15), 1),
        },
        defense: {
            base: Math.max(Math.round(stats[2].base_stat/15), 1),
        },
        specialAttack: {
            base: Math.max(Math.round(stats[3].base_stat/15), 1),
        },
        specialDefense: {
            base: Math.max(Math.round(stats[4].base_stat/15), 1),
        },
        speed: {
            base: Math.max(Math.round(stats[5].base_stat/15), 1),
        },
    };
    
    handledStats.hitPoints["boost"] = getHitPointsBoost(stats[0].base_stat, handledStats.hitPoints.base);
    handledStats.attack["boost"] = getOtherStatsBoost(stats[1].base_stat, handledStats.attack.base);
    handledStats.defense["boost"] = getOtherStatsBoost(stats[2].base_stat, handledStats.defense.base);
    handledStats.specialAttack["boost"] = getOtherStatsBoost(stats[3].base_stat, handledStats.specialAttack.base);
    handledStats.specialDefense["boost"] = getOtherStatsBoost(stats[4].base_stat, handledStats.specialDefense.base);
    handledStats.speed["boost"] = getOtherStatsBoost(stats[5].base_stat, handledStats.speed.base);

    return handledStats;
}

/**
 * Calculates hit point's boos using both the pokemon games base stat and curated stat
 * 
 * @param {number} baseStat 
 * @param {number} curatedStat 
 * @returns {number}
 */
function getHitPointsBoost(baseStat, curatedStat) {
    return Math.round(((((2*baseStat)+110)/10)-curatedStat)/6);
}

/**
 * Calculates other stat's boos using both the pokemon games base stat and curated stat
 * 
 * @param {number} baseStat 
 * @param {number} curatedStat 
 * @returns {number}
 */
function getOtherStatsBoost(baseStat, curatedStat) {
    return Math.round((((((2*baseStat)+99)*1.1)/15)-curatedStat)/6);
}

/**
 * Returns how it costs to learn the move.
 * 
 * @param {object} moveGameVersion 
 * @returns {number}
 */
function getLearningCost(moveGameVersion) {
    switch(moveGameVersion.move_learn_method.name) {
        case "level-up":
            return Math.ceil(moveGameVersion.level_learned_at/15);

        case "egg":
            return 2;

        case "machine":
           return 3;

        case "tutor":
            return 4;

        default:
            return 5
    }
}