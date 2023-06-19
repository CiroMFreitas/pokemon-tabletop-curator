import Pokedex from 'pokedex-promise-v2';
import curatePokemon from './pokemon.js';
import curateAbilities from './abilities.js';
import curateMoves from './moves.js';

// API Wrapper
const POKEDEX = new Pokedex();
// Region Pokedex which you want to import your pokemons
const REGION_DEX = "kanto";

function start() {
  curatePokemon(POKEDEX, REGION_DEX).then((response) => {
    const { abilities, moves } = response;
    curateAbilities(POKEDEX, abilities);
    curateMoves(POKEDEX, moves);
  });
}

start();