// Shared utilitarian methods

const FLAVOR_TEXT_VERSION = [
  "scarlet-violet",
  "brilliant-diamond-and-shining-pearl",
  "sword-shield",
  "lets-go-pikachu-lets-go-eevee",
  "ultra-sun-ultra-moon",
];

const FLAVOR_TEXT_VERSION_COUNTER = {
    scarletviolet: 0,
    brilliantdiamondandshiningpearl: 0,
    swordshield: 0,
    letsgopikachuletsgoeevee: 0,
    ultrasunultramoon: 0,
}

/**
 * Capitalizes string.
 * 
 * @param {string} str 
 * @returns {string}
 */
export function capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gets latest game version flavor text for an ability or move, flavor_text_entries object expects to be a
 * flavor_text_entries endpoint from a ability or move using pokedex-promise-v2.
 * 
 * If no version is found, process will shut down as it's intended to sinalize that I need to find the next 
 * possible version and add to the switch case.
 * 
 * @param {object} flavor_text_entries 
 * @param {string} name 
 * @returns {string}
 */
export async function getLatestFlavorText(flavor_text_entries, name) {
  if(flavor_text_entries.length == 0) {
    return "Missing.";
  }

  for(const entry of flavor_text_entries) {

      for(const gameVersion of FLAVOR_TEXT_VERSION) {
        if(entry.version_group.name == gameVersion) {
            FLAVOR_TEXT_VERSION_COUNTER[gameVersion.replaceAll("-", "")] += 1;
            return entry.flavor_text;
        }
      }
  }

  // Code to be uncommented when API data is updated
  //console.log("No game version with " + capitalizeString(name) + " flavor text! :(");
  //process.exit();
}