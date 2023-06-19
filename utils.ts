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
  Default = "DEFAULT",
}

export interface CoverColor {
  background: string;
  text?: string;
}

export const colors: Array<CoverColor> = [
  { background: "#BBE2EE" },
  { background: "#CBF1EE" },
  { background: "#DDFEF0" },
  { background: "#FFEEBD" },
  { background: "#F1F2F2" },
];

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

/* @TODO - more materialtypes .. [dias, plakat, teateropførelse, cd rom, billede, sang, elektronisk materiale (cd), laborativt materiale, grafisk blad]*/
const materialTypeMap = {
  Bog: [
    "punktskrift",
    "bog",
    "billedbog",
    "billedbog (net)",
    "billedbog (online)",
    "tegneserie",
    "graphic novel",
    "bog stor skrift",
    "tegneserie (net)",
    "tegneserie (online)",
    "diskette",
  ],
  Lydbog: [
    "lyd (cd)",
    "lyd (cd-mp3)",
    "lydbog",
    "lydbog (cd)",
    "lydbog (net)",
    "lydbog (bånd)",
    "lydbog (cd-mp3)",
    "lyd",
    "lydbog (online)",
    "bog (elektronisk)",
  ],
  Ebog: ["ebog", "e-bog"],
  Tidsskrift: [
    "tidsskrift",
    "periodikum",
    "avis",
    "magasin",
    "årbog",
    "periodikum (net)",
    "tidsskrift (net)",
    "tidsskrift (online)",
  ],
  Artikel: ["tidsskriftsartikel", "avisartikel", "artikel", "anmeldelse","artikel (online)"],
  Podcast: ["lyd (podcast)"],
  Film: [
    "film",
    "dvd",
    "blu-ray",
    "blu-ray 4k",
    "film (net)",
    "blu-ray 3d",
    "video",
    "biograffilm",
    "film (dvd)",
    "film (blu-ray)",
    "film (online)",
    "film (blu-ray 4K)",
    "film (blu-ray 4k)",
    "film (blu-ray 3D)",
    "film (blu-ray 3d)",
    "film (videobånd)",
    "film (spole)",
    "film (elektronisk)",
  ],
  //"Tv-serie" = "TVSERIE", /* Dækker alle varianter (eksempelvis blue-ray, dvd, video) og også online (net, online) */
  Musik: [
    "musik",
    "bånd",
    "grammofonplade",
    "dvd (musik)",
    "cd (musik)",
    "musik (net)",
    "musik (online)",
    "musik (dvd)",
    "musik (blu-ray)",
    "musik (videobånd)",
  ],
  Node: ["node"],
  Computerspil: [
    "playstation vita",
    "wii",
    "wii u",
    "psp",
    "nintendo ds",
    "xbox 360",
    "playstation 3",
    "xbox one",
    "playstation 4",
    "pc-spil",
    "pc-spil (net)",
    "nintendo switch",
    "wii",
    "playstation 2",
    "xbox",
    "computerspil",
    "gameboy advance",
  ],
  Brætspil: ["spil", "brætspil",],
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
  return "Default";
}

/**
 * Converts hex color to rgb
 */
export function hexToRgb(hex: string): Array<number> {
  return (
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      .exec(hex)
      ?.slice(1)
      ?.map((res) => parseInt(res, 16)) || [0, 0, 0]
  );
}

/**
 * Euclidean distance in 3 dimensions
 */
export function distance(point1: Array<number>, point2: Array<number>): number {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) +
      Math.pow(point1[1] - point2[1], 2) +
      Math.pow(point1[2] - point2[2], 2)
  );
}
