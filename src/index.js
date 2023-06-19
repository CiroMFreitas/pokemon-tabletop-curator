import Pokedex from 'pokedex-promise-v2';
import * as fs from 'fs';
import curatePokemon from './pokemon.js';
import capitalizeString from "./utils.js";

// API Wrapper
const POKEDEX = new Pokedex();
// Region Pokedex which you want to import your pokemons
const REGION_DEX = "kanto";

function start() {
  const pokedex = new Pokedex();
  curatePokemon(pokedex, REGION_DEX).then((response) => {
    const { abilities, moves } = response;
    curateAbilities(abilities);
    curateMoves(moves);
  });
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