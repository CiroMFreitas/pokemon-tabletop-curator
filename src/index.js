import Pokedex from 'pokedex-promise-v2';
import * as fs from 'fs';
import capitalizeString from "./utils.js";

// API Wrapper
const POKEDEX = new Pokedex();
// Region Pokedex which you want to import your pokemons
const REGION_DEX = "kanto";

function start() {
    curatePokemon().then((response) => {
      const { abilities, moves } = response;
      curateAbilities(abilities);
      curateMoves(moves);
    });
}

async function curatePokemon() {
  console.log("Starting pokemon data collection!");
  const curatedPokemons = [];
  const abilities = [];
  const moves = [];
  
  const searchDex = await POKEDEX.getPokedexByName(REGION_DEX);
  for(const entry of searchDex.pokemon_entries) {
    const pokemon = await POKEDEX.getPokemonByName(entry.pokemon_species.name);
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

        // Get relevant abilities names
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
      abilities: abilities,
      hitpoints: Math.max(Math.round(pokemon.stats[0].base_stat/10), 1),
      attack: Math.max(Math.round(pokemon.stats[1].base_stat/20), 1),
      defense: Math.max(Math.round(pokemon.stats[2].base_stat/20), 1),
      specialAttack: Math.max(Math.round(pokemon.stats[3].base_stat/20), 1),
      specialDefense: Math.max(Math.round(pokemon.stats[4].base_stat/20), 1),
      speed: Math.max(Math.round(pokemon.stats[5].base_stat/20), 1),
      moves: pokemonMoves,
    });
    console.log(firstLettertoUpperCase(pokemon.name) + " collected!")
  }

  // Write file with curated pokemons data and returns all relevant abilities and moves names
  fs.writeFileSync("./collected_data/pokemons.json", JSON.stringify(curatedPokemons));
  console.log("Pokemons " + curatedPokemons.length + " collected!");
  return {
    abilities: abilities,
    moves: moves,
  };
}

async function curateAbilities(abilities) {
  console.log("Starting abilities data collection!");
  const curatedAbilities = [];

  for(const ability of abilities) {
    const newAbility = await POKEDEX.getAbilityByName(ability);
    const newAbilityFlavorText = await getLatestFlavorText(newAbility.flavor_text_entries, ability);

    curatedAbilities.push({
      name: newAbility.name,
      flavorText: newAbilityFlavorText.replace("\n", " "),
    });
    console.log(capitalizeString(ability) + " ability collected!");
  }

  // Writes curated abilities file
  fs.writeFileSync("./collected_data/abilities.json", JSON.stringify(curatedAbilities));
  console.log("Abilities " + curatedAbilities.length + " collected!");
}

async function curateMoves(moves) {
  console.log("Starting moves data collection!");
  const curatedMoves = [];

  for(const move of moves) {
    const newMove = await POKEDEX.getMoveByName(move);
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

// Utils
function firstLettertoUpperCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

async function getPokemonLatestMoveSetVersion(pokemonName, moves) {
  for(const move of moves) {
    switch(true) {
      case move.version_group_details.find((version) => version.version_group.name == "scarlet-violet") != undefined:
        return "scarlet-violet";
  
      case move.version_group_details.find((version) => version.version_group.name == "sword-shield") != undefined:
        return "sword-shield";
  
      case move.version_group_details.find((version) => version.version_group.name == "brilliant-diamond-and-shining-pearl") != undefined:
        return "brilliant-diamond-and-shining-pearl";
  
        case move.version_group_details.find((version) => version.version_group.name == "lets-go-pikachu-lets-go-eevee") != undefined:
          return "lets-go-pikachu-lets-go-eevee";
    }
  }
      
  // Used to detect which pokemon is missing in order to added more cases above
  //moves[0].version_group_details.forEach((version) => {
  //  console.log(version);
  //});
  //console.log(await POKEDEX.getVersionGroupsList());
  console.log("No game version with " + firstLettertoUpperCase(pokemonName) + " moves! :(");
  process.exit();
}

async function getLatestFlavorText(flavor_text_entries, name) {  
  for(const entry of flavor_text_entries) {
    switch (entry.version_group.name) {
      case "scarlet-violet":
        return flavor_text_entries.find((founEntry) => founEntry.language.name == "en" && entry.version_group.name == "scarlet-violet").flavor_text;
  
      case "sword-shield":
        return flavor_text_entries.find((founEntry) => founEntry.language.name == "en" && entry.version_group.name == "sword-shield").flavor_text;
    }
  }
  
  if(flavor_text_entries.length == 0) {
    return "None.";
  } else {
    console.log("No game version with " + capitalizeString(name) + " flavor text! :(");
    process.exit();
  }
}

start();