import {promises as Fs} from "fs";

import {colors, materialTypes, sizes} from "../utils";
import {IDefaultQuerystring} from "../index";

const _ = require("lodash")

/**
 * Generate a file. Return uid of file. Let graphql api handle url generation.
 * @param query
 */
export async function generate(query: IDefaultQuerystring): Promise<string> {
    const {title, materialType} = query
    // we need to generate same hash each time - use 'uuid-by-string' @see https://www.npmjs.com/package/uuid-by-string
    const getUuid = require('uuid-by-string');
    const uuidHash = getUuid(`${title}${materialType}`);
    let svgAsString = await read(materialType);
    const buf = Buffer.from(replaceInSvg(svgAsString, title));
    Object.keys(sizes).forEach((size) => {
        const imagePath = pathToImage(uuidHash, size);
        svg2Image(buf, imagePath, size);
    })
    return generateUrl(uuidHash);
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
 * Return unique id of to the image generated.
 */
function generateUrl(path = "", filename = ""): string {
    return path;
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
    const svgTitle = lines.map((line)=>'<tspan x="50%" dy="1.2em">' + line + '</tspan>').join(' ');
    return svg.replace("TITLE_TEMPLATE", svgTitle).replace("COLOR_TEMPLATE", svgColor);
}

/**
 * Attempt to split a long title...
 *     // NOTE .. approximately 24 characters / line ..
 *
 * @param longTitle
 */
function splitString(longTitle: string): Array<string> {
    const parts = longTitle.split(' ');
    const arrayToReturn: Array<string> = [];

    let line: string = "";
    let globalIndex = 0;
    parts.forEach((part, index) => {
        if (line.length + part.length > 23) {
            arrayToReturn.push(line)
            line = "";
            globalIndex = index;
        }
        line += ' ' + part;
    })
    // the rest of the text
    arrayToReturn.push(parts.splice(globalIndex).join(' '));

    return arrayToReturn.length > 0 ? arrayToReturn : [longTitle];
}

/**
 * helper function to read the (svg) file.
 * @returns {Promise<string>} | String
 */
async function read(materialType: string): Promise<string> {
    try {
        const index: number = Object.keys(materialTypes).indexOf(_.upperFirst(materialType));
        const matType = Object.values(materialTypes)[index];
        return await Fs.readFile(`templates/${matType}.svg`, {encoding: "utf8"});
    } catch (e) {
        console.log(`Read  failed:`, {
            error: String(e)
        });
        return "";
    }
}
