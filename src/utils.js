// Shared utilitarian methods

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