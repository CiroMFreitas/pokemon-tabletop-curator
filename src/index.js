import Pokedex from 'pokedex-promise-v2';
import curatePokemon from './pokemon.js';
import curateAbilities from './abilities.js';
import curateMoves from './moves.js';

// API Wrapper
const POKEDEX = new Pokedex();
// Region Pokedex which you want to import your pokemons
const REGION_DEX = "kanto";

/**
 * Searchs pokemons and theis abilities and moves, curating necessary data on the go.
 * 
 * It's data is curated for my needs, so it may not make sense as is.
 * 
 * Beware some regions with a bigger pokedex entry, notably the national dex, will take it's sweet time 
 * curating.
 */
function start() {
  curatePokemon(POKEDEX, REGION_DEX).then((response) => {
    const { abilities, moves } = response;
    curateAbilities(POKEDEX, abilities);
    curateMoves(POKEDEX, moves);
  });
}

start();