export enum materialTypes {
  Bog = "BOG" /*Dækker også varianter for Billedbog, Tegneserie, Graphic novel, Stor skrift*/,
  Lydbog = "LYDBOG" /*Dækker også alle fysiske varianter (eksempelvis: CD, mp3, bånd) også Lydbog (net)*/,
  "Ebog" = "EBOG",
  Tidsskrift = "TIDSSKRIFT" /* Benyttes også for Avis, Magasin, Årbog*/,
  Artikel = "ARTIKEL" /*Benyttes også for Avisartikel, Anmeldelse*/,
  Podcast = "PODCAST",
  Film = "FILM" /* Dækker alle varianter (eksempelvis: blu-ray, dvd, video) og også online (net, online) */,
  "Tv-serie" = "TVSERIE" /* Dækker alle varianter (eksempelvis blue-ray, dvd, video) og også online (net, online) */,
  Musik = "MUSIK" /* Dækker alle varianter (eksempelvis bånd, cd, grammofonplade) */,
  Node = "NODE",
  Computerspil = "COMPUTERSPIL" /* Dækker alle varianter (eksempelvis PC-spil, Gameboy, Playstation, Nintendo, Xbox, Wii) */,
  Brætspil = "BRÆTSPIL",
}

export enum colors {
  BBE2EE = "#BBE2EE",
  CBF1EE = "#CBF1EE",
  DDFEF0 = "#DDFEF0",
  FFEEBD = "#FFEEBD",
  F1F2F2 = "#F1F2F2",
}

export enum sizes {
  thumbnail = "THUMBNAIL",
  large = "LARGE",
}

export enum formats {
  jpg = "JPG",
  gif = "GIF",
  png = "PNG",
  svg = "SVG",
}

export interface IFormats {
  format: formats;
  width?: string;
  height?: string;
}

const xmlSpecialChars: any = {
  "&": "&amp;",
  '"': "&quot;",
  "<": "&lt;",
  ">": "&gt;",
};

export function encodeXmlSpecialChars(stringToEscape: string): string {
  return stringToEscape.replace(/([&"<>])/g, function (str, item) {
    return xmlSpecialChars[item];
  });
}

/**
 * @file - mapping for materialTypes - mostly for default forside service
 */

/* @TODO - more materialtypes .. []*/
const materialTypeMap = {
  Puslespil: ["puslespil"],
  Bog: [
    "punktskrift",
    "bog",
    "billedbog",
    "tegneserie",
    "graphic novel",
    "bog stor skrift",
  ],
  Lydbog: [
    "lyd (cd)",
    "lydbog",
    "lydbog (cd)",
    "lydbog (net)",
    "lydbog (bånd)",
    "lydbog (cd-mp3)",
    "lyd",
  ],
  Ebog: ["ebog"],
  Tidsskrift: [
    "tidsskrift",
    "periodikum",
    "avis",
    "magasin",
    "årbog",
    "periodikum (net)",
    "tidsskrift (net)",
  ],
  Artikel: ["tidsskriftsartikel", "avisartikel", "artikel", "anmeldelse"],
  //Podcast = "PODCAST",
  Film: ["film", "blu-ray", "blu-ray 4k"],
  //"Tv-serie" = "TVSERIE", /* Dækker alle varianter (eksempelvis blue-ray, dvd, video) og også online (net, online) */
  Musik: [
    "musik",
    "bånd",
    "grammofonplade",
    "dvd",
    "cd (musik)",
    "musik (net)",
  ],
  Node: ["node"],
  Computerspil: [
    "playstation vita",
    "wii",
    "psp",
    "nintendo ds",
    "xbox 360",
    "playstation 3",
    "xbox one",
    "playstation 4",
    "pc-spil",
    "nintendo switch",
    "wii",
    "playstation 2",
    "xbox",
    "diskette",
  ],
  Brætspil: ["spil"],
};

export function mapMaterialType(materialType: string): string {
  let found = false;
  for (const [key, value] of Object.entries(materialTypeMap)) {
    if (value.includes(materialType.toLowerCase())) {
      found = true;
      return key;
    }
  }
  if (!found) {
    console.log("MATTYPE " + materialType + "NOT FOUND");
  }
  return "Bog";
}
