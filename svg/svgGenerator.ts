import {promises as Fs} from "fs";

import {colors, materialTypes, sizes} from "../utils";
import {ICovers, ICoversArray} from "../index";

const _ = require("lodash")

/**
 * Entry function for GET request.
 * Generate a file. Return uid of file. Let graphql api handle url generation.
 * @param query
 */
export function generate(query: ICovers): string {
    const {title, materialType} = query
    // we need to generate same hash each time - use 'uuid-by-string' @see https://www.npmjs.com/package/uuid-by-string
    const getUuid = require('uuid-by-string');
    const uuidHash = getUuid(`${title}${materialType}`);
    read(materialType).then((svgAsString) => {
        const buf = Buffer.from(replaceInSvg(svgAsString, title));
        Object.keys(sizes).forEach((size) => {
            const imagePath = pathToImage(uuidHash, size);
            svg2Image(buf, imagePath, size);
        })
    });

    return uuidHash;
}

/**
 * Entry function for POST request.
 * Handle an array of Covers (ICovers). Return an array of uuid's generated.
 * @param payLoad
 */
export function generateArray(payLoad: ICoversArray): Array<string> {
    const {coverParams} = payLoad;
    const returnValues: Array<string> = [];
    coverParams.forEach((cover) => returnValues.push(generate(cover)));
    return returnValues;
}

/**
 * Generate an image from given parameters. Write file with given path and given format.
 * @param svgString
 * @param path
 * @param format -defaults to 'svg'
 * @param size
 */
function svg2Image(svgString: Buffer, path: string, size: string): void {
    const sharp = require("sharp")
    const sizes = size === "large" ? {width: 300, height: 460} : {width: 75, height: 115}
    sharp(svgString)
        .resize(sizes)
        .jpeg({
            width: sizes.width,
            height: sizes.height,
        })
        .toFile(`${path}.jpg`, (err: any, info: any) => {
            console.log(err, "ERROR")
            console.log(info, "INFO")
        });
}

/**
 * Return path of the file to be written.
 * @param title
 * @param materialType
 * @param size
 */
function pathToImage(uuidHash: string, size: string): string {
    return `images/${size}/${uuidHash}`;
}

/**
 * Get a random color from colors enum.
 */
function randomColor(): string {
    const items = Object.values(colors);
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
function replaceInSvg(svg: string, title: string): string {
    const svgColor = randomColor();
    // split string if it is to long
    const lines = splitString(title);
    // insert each part of string in <tspan> element
    const svgTitle = lines.map((line) => '<tspan x="50%" dy="1.2em">' + line + '</tspan>').join(' ');
    return svg.replace("TITLE_TEMPLATE", svgTitle).replace("COLOR_TEMPLATE", svgColor);
}

/**
 * Attempt to split a long title...
 * TODO -- a better split string function - it looks horrible
 *
 * @param longTitle
 */
export function splitString(longTitle: string): Array<string> {
    const parts = longTitle.split(' ');
    let arrayToReturn: Array<string> = [];

    // from google
    arrayToReturn = arrayToReturn.concat.apply([],
        longTitle.split('').map(function (title, index) {
            return index % 21 ? [] : longTitle.slice(index, index + 21) + '-'
        })
    )

    // sanitize the array
    // remove last '-' in array
    const index = arrayToReturn.length - 1;
    arrayToReturn[index] = arrayToReturn[index].slice(0, -1)

    return arrayToReturn;
}

/**
 * helper function to read the (svg) file.
 * @returns {Promise<string>} | String
 */
async function read(materialType: string): Promise<string> {
    try {
        // get materialtype value from materialTypes enum
        const index: number = Object.keys(materialTypes).indexOf(_.upperFirst(materialType));
        const matType = Object.values(materialTypes)[index];
        // read the template
        return await Fs.readFile(`templates/${matType}.svg`, {encoding: "utf8"});
    } catch (e) {
        console.log(`Read  failed:`, {
            error: String(e)
        });
        return "";
    }
}
