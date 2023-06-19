import Pokedex from 'pokedex-promise-v2';
import * as fs from 'fs';
import curatePokemon from './pokemon.js';
import { capitalizeString, getLatestFlavorText }  from "./utils.js";
import curateAbilities from './abilities.js';

// API Wrapper
const POKEDEX = new Pokedex();
// Region Pokedex which you want to import your pokemons
const REGION_DEX = "kanto";

function start() {
  curatePokemon(POKEDEX, REGION_DEX).then((response) => {
    const { abilities, moves } = response;
    curateAbilities(POKEDEX, abilities);
    curateMoves(moves);
  });
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

start();