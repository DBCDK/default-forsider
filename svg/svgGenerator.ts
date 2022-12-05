import { promises as Fs, stat } from "fs";
import { existsSync } from "fs";
import { workingDirectory } from "../index";
import sharp from "sharp";

// @ts-ignore
import { log } from "dbc-node-logger";

import {
  colors as defaultCovers,
  CoverColor,
  encodeXmlSpecialChars,
  mapMaterialType,
  materialTypes,
  sizes,
} from "../utils";
import { ICovers, ICoversArray, checkRequest } from "../index";
import { registerDuration, initHistogram } from "../monitor";

const _ = require("lodash");

const PERFORMANCE_HISTOGRAM_NAME = "image_generation";
initHistogram(PERFORMANCE_HISTOGRAM_NAME);

interface IReturnCover {
  error?: string;
  thumbNail?: string;
  detail?: string;
}

/**
 * Entry function for GET request.
 * Generate a file. Return uid of file. Let graphql api handle url generation.
 * @param query
 */
export function generate(query: ICovers): IReturnCover {
  const { title, materialType, colors } = query;

  const mappedMaterial: string = mapMaterialType(materialType);
  // we need to generate same hash each time - use 'uuid-by-string' @see https://www.npmjs.com/package/uuid-by-string
  const getUuid = require("uuid-by-string");

  const status = checkRequest(query);

  if (!status.status) {
    console.log(status);
    return {
      error: status.message,
    };
  }

  const uuidHash = getUuid(`${title}${mappedMaterial}`);
  if (!doesFileExist(uuidHash)) {
    read(mappedMaterial).then((svgAsString) => {
      // @TODO check string - it might be empty

      const buf = Buffer.from(replaceInSvg(svgAsString, title, colors));
      Object.keys(sizes).forEach((size) => {
        const imagePath = pathToImage(uuidHash, size);
        svg2Image(buf, imagePath, size);
      });
    });
  }

  // @TODO return an object - like : {thumbNail:"thumbnail/uuidhash", detail:"large/uuidhash"}
  return {
    thumbNail: `${workingDirectory}/thumbnail/${uuidHash}.jpg`,
    detail: `${workingDirectory}/large/${uuidHash}.jpg`,
  };
}

/**
 * Check if file with given uuid exists already.
 * @param uuid
 */
function doesFileExist(uuid: string): boolean {
  const pathToFile = pathToImage(uuid, "large") + ".jpg";
  return existsSync(pathToFile);
}

/**
 * Entry function for POST request.
 * Handle an array of Covers (ICovers). Return an array of uuid's generated.
 * @param payLoad
 */
export function generateArray(payLoad: any): Array<IReturnCover> {
  const coverParams = payLoad;
  const returnValues: Array<IReturnCover> = [];
  payLoad.forEach((cover: ICovers) => returnValues.push(generate(cover)));
  return returnValues;
}

/**
 * Generate an image from given parameters. Write file with given path and given format.
 * @param svgString
 * @param path
 * @param size
 */
function svg2Image(svgString: Buffer, path: string, size: string): void {
  const sizes =
    size === "large" ? { width: 300, height: 460 } : { width: 75, height: 115 };
  const timestamp = performance.now();
  sharp(svgString)
    .resize(sizes)
    .jpeg()
    .toFile(`${path}.jpg`, (err: any, info: any) => {
      const total_ms = performance.now() - timestamp;
      registerDuration(PERFORMANCE_HISTOGRAM_NAME, total_ms);

      if (err) {
        log.error("Image generation failed", {
          path: `${path}.jpg`,
          total_ms,
        });
        return;
      }
      log.info("Image generated", {
        total_ms,
        imgInfo: {
          path: `${path}.jpg`,
          size: info.size,
        },
      });
    });
}

/**
 * Return path of the file to be written.
 * @param title
 * @param materialType
 * @param size
 */
function pathToImage(uuidHash: string, size: string): string {
  return `images/${workingDirectory}/${size}/${uuidHash}`;
}

/**
 * Get a random color from colors enum.
 */
function randomColor(colors: Array<CoverColor>): CoverColor {
  const items = colors || defaultCovers;
  const keys = Object.keys(items);
  const random: number = +keys[Math.floor(Math.random() * keys.length)];

  return items[random];
}

/**
 * Replace in template with given values and a random fill color.
 * Handle and insert title af cover.
 * @param svg
 * @param title
 */
function replaceInSvg(
  svg: string,
  title: string,
  colors: Array<CoverColor>
): string {
  const svgColor = randomColor(colors);
  // split string if it is to long
  const lines = splitString(title, 15, 15, 4, 15);

  const largeFont =
    lines.every((line) => line.length <= 11) && lines.length <= 2;

  const lineHeight = largeFont ? 50 : 38;
  const fontSize = largeFont ? 39 : 30;
  // insert each part of string in <tspan> element
  const svgTitle = lines
    .map(
      (line) =>
        `<tspan x="50%" font-size="${fontSize}px" dy="${lineHeight}px">` +
        encodeXmlSpecialChars(line) +
        "</tspan>"
    )
    .join(" ");
  return svg
    .replace("TITLE_TEMPLATE", svgTitle)
    .replace("COLOR_TEMPLATE", svgColor.background);
}

const INVALID_CONSONANT_CONNECTIONS_BEGINNING = new Set([
  "bb",
  "bc",
  "bd",
  "bf",
  "bg",
  "bh",
  "bj",
  "bk",
  "bm",
  "bn",
  "bp",
  "bq",
  "bs",
  "bt",
  "bv",
  "bx",
  "bz",
  "cb",
  "cc",
  "cd",
  "cf",
  "cg",
  "cj",
  "ck",
  "cl",
  "cm",
  "cn",
  "cp",
  "cq",
  "cr",
  "cs",
  "ct",
  "cv",
  "cx",
  "cz",
  "db",
  "dc",
  "dd",
  "df",
  "dg",
  "dh",
  "dj",
  "dk",
  "dl",
  "dm",
  "dn",
  "dp",
  "dq",
  "ds",
  "dt",
  "dv",
  "dx",
  "dz",
  "fb",
  "fc",
  "fd",
  "ff",
  "fg",
  "fh",
  "fj",
  "fk",
  "fm",
  "fn",
  "fp",
  "fq",
  "fs",
  "ft",
  "fv",
  "fx",
  "fz",
  "gb",
  "gc",
  "gd",
  "gf",
  "gg",
  "gh",
  "gj",
  "gk",
  "gl",
  "gm",
  "gn",
  "gp",
  "gq",
  "gs",
  "gt",
  "gv",
  "gx",
  "gz",
  "hb",
  "hc",
  "hd",
  "hf",
  "hg",
  "hh",
  "hj",
  "hk",
  "hl",
  "hm",
  "hn",
  "hp",
  "hq",
  "hr",
  "hs",
  "ht",
  "hx",
  "hz",
  "jb",
  "jc",
  "jd",
  "jf",
  "jg",
  "jh",
  "jj",
  "jk",
  "jl",
  "jm",
  "jn",
  "jp",
  "jq",
  "jr",
  "js",
  "jt",
  "jv",
  "jx",
  "jz",
  "kb",
  "kc",
  "kd",
  "kf",
  "kg",
  "kh",
  "kj",
  "kk",
  "km",
  "kn",
  "kp",
  "kq",
  "ks",
  "kt",
  "kv",
  "kx",
  "kz",
  "lb",
  "lc",
  "ld",
  "lf",
  "lg",
  "lh",
  "lj",
  "lk",
  "ll",
  "lm",
  "ln",
  "lp",
  "lq",
  "lr",
  "ls",
  "lt",
  "lv",
  "lx",
  "lz",
  "mb",
  "mc",
  "md",
  "mf",
  "mg",
  "mh",
  "mj",
  "mk",
  "ml",
  "mm",
  "mn",
  "mp",
  "mq",
  "mr",
  "ms",
  "mt",
  "mv",
  "mx",
  "mz",
  "nb",
  "nc",
  "nd",
  "nf",
  "ng",
  "nh",
  "nj",
  "nk",
  "nl",
  "nm",
  "nn",
  "np",
  "nq",
  "nr",
  "ns",
  "nt",
  "nv",
  "nx",
  "nz",
  "pb",
  "pc",
  "pd",
  "pf",
  "pg",
  "pj",
  "pk",
  "pm",
  "pn",
  "pp",
  "pq",
  "ps",
  "pt",
  "pv",
  "px",
  "pz",
  "qb",
  "qc",
  "qd",
  "qf",
  "qg",
  "qh",
  "qj",
  "qk",
  "ql",
  "qm",
  "qn",
  "qp",
  "qq",
  "qr",
  "qs",
  "qt",
  "qv",
  "qx",
  "qz",
  "rb",
  "rc",
  "rd",
  "rf",
  "rg",
  "rh",
  "rj",
  "rk",
  "rl",
  "rm",
  "rn",
  "rp",
  "rq",
  "rr",
  "rs",
  "rt",
  "rv",
  "rx",
  "rz",
  "sb",
  "sd",
  "sf",
  "sg",
  "sh",
  "sj",
  "sl",
  "sm",
  "sn",
  "sq",
  "sr",
  "ss",
  "sx",
  "sz",
  "tb",
  "tc",
  "td",
  "tf",
  "tg",
  "tj",
  "tk",
  "tl",
  "tm",
  "tn",
  "tp",
  "tq",
  "ts",
  "tt",
  "tv",
  "tx",
  "tz",
  "vb",
  "vc",
  "vd",
  "vf",
  "vg",
  "vh",
  "vj",
  "vk",
  "vl",
  "vm",
  "vn",
  "vp",
  "vq",
  "vr",
  "vs",
  "vt",
  "vv",
  "vx",
  "vz",
  "xb",
  "xc",
  "xd",
  "xf",
  "xg",
  "xh",
  "xj",
  "xk",
  "xl",
  "xm",
  "xn",
  "xp",
  "xq",
  "xr",
  "xs",
  "xt",
  "xv",
  "xx",
  "xz",
  "zb",
  "zc",
  "zd",
  "zf",
  "zg",
  "zh",
  "zj",
  "zk",
  "zl",
  "zm",
  "zn",
  "zp",
  "zq",
  "zr",
  "zs",
  "zt",
  "zv",
  "zx",
  "zz",
]);
const INVALID_CONSONANT_CONNECTIONS_END = new Set([
  "bb",
  "bc",
  "bd",
  "bf",
  "bg",
  "bh",
  "bj",
  "bk",
  "bl",
  "bm",
  "bn",
  "bp",
  "bq",
  "br",
  "bs",
  "bt",
  "bv",
  "bx",
  "bz",
  "cb",
  "cc",
  "cd",
  "cf",
  "cg",
  "cj",
  "ck",
  "cl",
  "cm",
  "cn",
  "cp",
  "cq",
  "cr",
  "ct",
  "cv",
  "cx",
  "cz",
  "db",
  "dc",
  "dd",
  "df",
  "dg",
  "dh",
  "dj",
  "dk",
  "dl",
  "dm",
  "dn",
  "dp",
  "dq",
  "dr",
  "dv",
  "dx",
  "dz",
  "fb",
  "fc",
  "fd",
  "ff",
  "fg",
  "fh",
  "fj",
  "fk",
  "fl",
  "fm",
  "fn",
  "fp",
  "fq",
  "fr",
  "fs",
  "fv",
  "fx",
  "fz",
  "gb",
  "gc",
  "gd",
  "gf",
  "gg",
  "gh",
  "gj",
  "gk",
  "gl",
  "gm",
  "gn",
  "gp",
  "gq",
  "gr",
  "gv",
  "gx",
  "gz",
  "hb",
  "hc",
  "hd",
  "hf",
  "hg",
  "hh",
  "hj",
  "hk",
  "hl",
  "hm",
  "hn",
  "hp",
  "hq",
  "hr",
  "hs",
  "hv",
  "hx",
  "hz",
  "jb",
  "jc",
  "jd",
  "jf",
  "jg",
  "jh",
  "jj",
  "jk",
  "jl",
  "jm",
  "jn",
  "jp",
  "jq",
  "jr",
  "js",
  "jt",
  "jv",
  "jx",
  "jz",
  "kb",
  "kc",
  "kd",
  "kf",
  "kg",
  "kh",
  "kj",
  "kk",
  "kl",
  "km",
  "kn",
  "kp",
  "kq",
  "kr",
  "ks",
  "kt",
  "kv",
  "kx",
  "kz",
  "lb",
  "lc",
  "lf",
  "lg",
  "lh",
  "lj",
  "lk",
  "lm",
  "ln",
  "lp",
  "lq",
  "lr",
  "lv",
  "lx",
  "lz",
  "mb",
  "mc",
  "md",
  "mf",
  "mg",
  "mh",
  "mj",
  "mk",
  "ml",
  "mm",
  "mn",
  "mp",
  "mq",
  "mr",
  "mt",
  "mv",
  "mx",
  "mz",
  "nb",
  "nc",
  "nf",
  "nh",
  "nj",
  "nk",
  "nl",
  "nm",
  "nn",
  "np",
  "nq",
  "nr",
  "nv",
  "nx",
  "nz",
  "pb",
  "pc",
  "pd",
  "pf",
  "pg",
  "ph",
  "pj",
  "pk",
  "pl",
  "pm",
  "pn",
  "pp",
  "pq",
  "pr",
  "ps",
  "pt",
  "pv",
  "px",
  "pz",
  "qb",
  "qc",
  "qd",
  "qf",
  "qg",
  "qh",
  "qj",
  "qk",
  "ql",
  "qm",
  "qn",
  "qp",
  "qq",
  "qr",
  "qs",
  "qt",
  "qv",
  "qx",
  "qz",
  "rb",
  "rc",
  "rf",
  "rh",
  "rj",
  "rl",
  "rm",
  "rp",
  "rq",
  "rr",
  "rv",
  "rx",
  "rz",
  "sb",
  "sc",
  "sd",
  "sf",
  "sg",
  "sh",
  "sj",
  "sl",
  "sm",
  "sn",
  "sp",
  "sq",
  "sr",
  "sv",
  "sx",
  "sz",
  "tb",
  "tc",
  "td",
  "tf",
  "tg",
  "tj",
  "tk",
  "tl",
  "tm",
  "tn",
  "tp",
  "tq",
  "tr",
  "tt",
  "tv",
  "tx",
  "tz",
  "vb",
  "vc",
  "vd",
  "vf",
  "vg",
  "vh",
  "vj",
  "vk",
  "vl",
  "vm",
  "vn",
  "vp",
  "vq",
  "vr",
  "vs",
  "vt",
  "vv",
  "vx",
  "vz",
  "xb",
  "xc",
  "xd",
  "xf",
  "xg",
  "xh",
  "xj",
  "xk",
  "xl",
  "xm",
  "xn",
  "xp",
  "xq",
  "xr",
  "xs",
  "xt",
  "xv",
  "xx",
  "xz",
  "zb",
  "zc",
  "zd",
  "zf",
  "zg",
  "zh",
  "zj",
  "zk",
  "zl",
  "zm",
  "zn",
  "zp",
  "zq",
  "zr",
  "zs",
  "zt",
  "zv",
  "zx",
  "zz",
]);
const VOCALS = "aeiouyæøå";

function hasVocals(str: string): boolean {
  for (var i = 0; i < str.length; i++) {
    if (VOCALS.includes(str.charAt(i))) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if it is ok to split a word at a specific position
 *
 * Performance wise, this is not optimized - but hopefully its
 * probably fast enough..
 *
 * We try to use these rules:
 * https://dsn.dk/ordboeger/retskrivningsordbogen/%C2%A7-15-17-orddeling-ved-linjeskift/%C2%A7-15-almindelige-retningslinjer/
 *
 */
export function canSplitAtPos(
  text: string,
  pos: number,
  wordSplitThreshold: number = 0
): boolean {
  const lowerCased = text.toLowerCase();
  let leftFull = lowerCased.slice(0, pos);
  leftFull = leftFull.slice(leftFull.lastIndexOf(" ") + 1, leftFull.length);
  let rightFull = lowerCased.slice(pos, lowerCased.length);
  const spacePosRight = rightFull.indexOf(" ");
  rightFull = rightFull.slice(
    0,
    spacePosRight > -1 ? spacePosRight : rightFull.length
  );

  const leftTwoCharacters = lowerCased.slice(Math.max(pos - 2, 0), pos);
  const rightTwoCharacters = lowerCased.slice(
    pos,
    Math.min(pos + 2, lowerCased.length)
  );

  if (leftFull.includes("-")) {
    return false;
  }
  if (leftFull.length + rightFull.length < wordSplitThreshold) {
    // Word is too short to split
    return false;
  }
  if (leftFull.length < 3 || rightFull.length < 3) {
    // We don't want short strings to be split.
    // This is not part of the dsn rules - but our own
    return false;
  }
  if (!hasVocals(leftFull)) {
    return false;
  }
  if (!hasVocals(rightFull)) {
    return false;
  }
  if (INVALID_CONSONANT_CONNECTIONS_BEGINNING.has(rightTwoCharacters)) {
    return false;
  }
  if (INVALID_CONSONANT_CONNECTIONS_END.has(leftTwoCharacters)) {
    return false;
  }

  return true;
}

export function splitString(
  longTitle: string,
  minWidth: number,
  maxWidth: number,
  maxLines: number,
  wordSplitThreshold: number = 0
): Array<string> {
  const res = [];

  // Try to divide characters evenly on four lines
  let width;
  if (longTitle.length <= maxWidth) {
    // Fits on one line
    width = maxWidth;
  } else if (longTitle.length / maxLines <= maxWidth) {
    // Fits on four lines, try to equal amount of characters per line
    width = Math.max(minWidth, Math.round(longTitle.length / maxLines));
  } else {
    // Exceeds four lines
    width = maxWidth;
  }

  // Loop through the long title
  let i = 0;
  while (i < longTitle.length) {
    // Jump to the current position + the calculated width
    // And then move back, until a valid split position is found
    let validSplitPos = i + width;
    let addHyphen = false;
    for (let j = validSplitPos; j > i; j--) {
      if (longTitle.charAt(j) === "") {
        // the end
        break;
      }
      if (longTitle.charAt(j) === "-") {
        // This is -, we can break line without hyphen
        validSplitPos = j + 1;
        break;
      }
      if (longTitle.charAt(j) === " ") {
        // This is a space we can break line without hyphen
        validSplitPos = j;
        break;
      } else if (canSplitAtPos(longTitle, j, wordSplitThreshold)) {
        // Found a position inside a word, where its ok to break
        // and we add a hyphen
        validSplitPos = j;
        addHyphen = true;
        break;
      }
    }
    res.push(longTitle.slice(i, validSplitPos) + (addHyphen ? "-" : ""));

    // Set the next offset, to the found valid position
    i = validSplitPos;
  }

  // Add dots if title is too long
  if (res.length > maxLines) {
    res[maxLines - 1] =
      res[maxLines - 1].slice(0, res[maxLines - 1].length - 3) + "...";
  }

  // Tada
  return res.slice(0, maxLines).map((line) => line.trim());
}

/**
 * helper function to read the (svg) file.
 * @returns {Promise<string>} | String
 */
async function read(materialType: string): Promise<string> {
  try {
    // get materialtype value from materialTypes enum
    const index: number = Object.keys(materialTypes).indexOf(
      _.upperFirst(materialType)
    );
    const matType = Object.values(materialTypes)[index];
    // read the template
    return await Fs.readFile(`templates/${matType}.svg`, { encoding: "utf8" });
  } catch (e) {
    console.log(`Read  failed:`, {
      error: String(e),
    });
    return "";
  }
}
