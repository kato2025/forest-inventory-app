// Utility Functions

// Species database
const species = [
  {n:"Abale",c:"1105",d:60},{n:"Abam",c:"3102",d:80},{n:"Aboudikro",c:"1120",d:80},{n:"Abura",c:"1101",d:60},
  {n:"Acajou Blanc",c:"3201",d:80},{n:"Acajou de Bassam",c:"3203",d:80},{n:"Afo",c:"3501",d:80},
  {n:"Aiele",c:"1401",d:80},{n:"Alan",c:"1108",d:60},{n:"Alep",c:"1121",d:60},{n:"Andok",c:"1122",d:80},
  {n:"Andong",c:"1126",d:60},{n:"Asseng",c:"3104",d:80},{n:"Avodiré",c:"3301",d:60},{n:"Ayous",c:"3408",d:70},
  {n:"Azobé",c:"1301",d:60},{n:"Baka",c:"3202",d:80},{n:"Bété",c:"1106",d:70},{n:"Bibolo",c:"3205",d:80},
  {n:"Bilinga",c:"1501",d:60},{n:"Bossé Clair",c:"3206",d:60},{n:"Bossé Foncé",c:"3207",d:60},
  {n:"Bubinga",c:"3213",d:80},{n:"Dabema",c:"1403",d:80},{n:"Dibetou",c:"3302",d:80},{n:"Douka",c:"3410",d:80},
  {n:"Doussié Blanc",c:"1124",d:60},{n:"Doussié Rouge",c:"1125",d:60},{n:"Ebana",c:"1112",d:60},
  {n:"Ekoune",c:"1702",d:80},{n:"Emien",c:"1139",d:80},{n:"Essia",c:"3411",d:80},{n:"Etimoe",c:"1132",d:60},
  {n:"Eyong",c:"1503",d:60},{n:"Fraké",c:"3402",d:70},{n:"Fromager",c:"1801",d:80},{n:"Ilomba",c:"3403",d:70},
  {n:"Iroko",c:"1901",d:80},{n:"Kosipo",c:"3209",d:80},{n:"Kotibé",c:"2001",d:60},{n:"Koto",c:"3502",d:60},
  {n:"Lati",c:"1115",d:60},{n:"Limba",c:"3404",d:70},{n:"Lotofa",c:"2101",d:60},{n:"Lovoa",c:"3210",d:60},
  {n:"Moabi",c:"1602",d:80},{n:"Movingui",c:"1135",d:60},{n:"Mukulungu",c:"1302",d:60},{n:"Niové",c:"2201",d:60},
  {n:"Okan",c:"1207",d:80},{n:"Okoumé",c:"1104",d:70},{n:"Onzabili",c:"1116",d:60},{n:"Ozigo",c:"1142",d:60},
  {n:"Padouk Rouge",c:"1703",d:80},{n:"Sapelli",c:"3214",d:80},{n:"Sipo",c:"3216",d:80},{n:"Tali",c:"1303",d:70},
  {n:"Tchitola",c:"1304",d:70},{n:"Tiama",c:"3217",d:80},{n:"Wengé",c:"1305",d:60},{n:"Zingana",c:"1306",d:60}
];

/**
 * Get species by name
 * @param {string} name - Species name
 * @returns {object} Species object
 */
function getSpeciesByName(name) {
  return species.find(s => s.n === name);
}

/**
 * Get all species names
 * @returns {array} Array of species names
 */
function getAllSpeciesNames() {
  return species.map(s => s.n);
}

/**
 * Parse CSV line handling quoted fields
 * @param {string} line - CSV line to parse
 * @returns {array} Array of values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Make species available globally
window.species = species;