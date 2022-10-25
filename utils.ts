export enum materialTypes {
  Bog = "BOG", /*Dækker også varianter for Billedbog, Tegneserie, Graphic novel, Stor skrift*/
  Lydbog = "LYDBOG", /*Dækker også alle fysiske varianter (eksempelvis: CD, mp3, bånd) også Lydbog (net)*/
  "E-bog" = "EBOG",
  Tidsskrift = "TIDSSKRIFT", /* Benyttes også for Avis, Magasin, Årbog*/
  Artikel = "ARTIKEL", /*Benyttes også for Avisartikel, Anmeldelse*/
  Podcast = "PODCAST",
  Film = "FILM", /* Dækker alle varianter (eksempelvis: blu-ray, dvd, video) og også online (net, online) */
  "Tv-serie" = "TVSERIE", /* Dækker alle varianter (eksempelvis blue-ray, dvd, video) og også online (net, online) */
  Musik = "MUSIK", /* Dækker alle varianter (eksempelvis bånd, cd, grammofonplade) */
  Node = "NODE",
  Computerspil = "COMPUTERSPIL", /* Dækker alle varianter (eksempelvis PC-spil, Gameboy, Playstation, Nintendo, Xbox, Wii) */
  Brætspil = "BRÆTSPIL"
}

export enum colors {
  BBE2EE = "#BBE2EE",
  CBF1EE = "#CBF1EE",
  DDFEF0 = "#DDFEF0",
  FFEEBD = "#FFEEBD",
  F1F2F2 = "#F1F2F2"
}

export enum sizes {
  thumbnail = "THUMBNAIL",
  large = "LARGE"
}

export enum formats {
  jpg="JPG",
  gif="GIF",
  png = "PNG",
  svg="SVG"
}

export interface IFormats{
  format:formats,
  width?:string,
  height?:string,
}
