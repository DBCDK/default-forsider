export enum GeneralMaterialTypeCode {
  ARTICLES = "ARTIKEL",
  AUDIO_BOOKS = "LYDBOG",
  BOARD_GAMES = "BRÆTSPIL",
  BOOKS = "BOG",
  COMICS = "DEFAULT",
  COMPUTER_GAMES = "COMPUTERSPIL",
  EBOOKS = "EBOG",
  FILMS = "FILM",
  IMAGE_MATERIALS = "DEFAULT",
  MUSIC = "MUSIK",
  NEWSPAPER_JOURNALS = "TIDSSKRIFT",
  OTHER = "DEFAULT",
  PODCASTS = "PODCAST",
  SHEET_MUSIC = "NODE",
  TV_SERIES = "DEFAULT",
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

export function mapMaterialType(materialType: string): string {
  const key: number = Object.keys(GeneralMaterialTypeCode).indexOf(
    materialType
  );
  const mappedValue = Object.values(GeneralMaterialTypeCode)[key];
  return mappedValue || "DEFAULT";
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
