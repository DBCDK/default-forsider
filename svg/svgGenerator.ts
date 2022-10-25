import {promises as Fs} from "fs";

import {formats, IFormats, sizes} from "../utils";
import {IDefaultQuerystring} from "../index";

/**
 * Generate a file. Return url to file.
 * TODO - more parameters (format(jpg, svg, gif ...), size(thumbnail, large .. )
 * @param query
 */
export async function generate(query: IDefaultQuerystring): Promise<string> {
    const {title, materialType} = query
    let svgAsString = await read(materialType);
    const buf = Buffer.from(replaceInSvg(svgAsString, title));
    Object.keys(sizes).forEach((size) => {
        const path = pathToImage(title, materialType, size);
        svg2Image(buf, path, size);
    })
    return generateUrl("fisk");
}

/**
 * Generate an image from given parameters. Write file with given path and given format.
 * @param svgString
 * @param path
 * @param format -defaults to 'svg'
 * @param size
 */
function svg2Image(svgString: Buffer, path: string, size:string): void {
    // @TODO filename -- some kind of uid
    const sharp = require("sharp")
    const sizes = size === "large" ? {width:150, height:300} : {width:75, height:150}
    sharp(svgString)
        .resize(sizes)
        .toFormat("jpg")
        .toFile(`${path}.jpg`, (err: any, info: any) => {
            console.log(err, "ERROR")
            console.log(info, "INFO")
        });
}

/**
 * TODO implement
 * Return path of the file to be written.
 * @param title
 * @param materialType
 * @param size
 */
function pathToImage(title: string, materialType:string, size: string): string {
    // we need to generate same hash each time - use 'uuid-by-string' @see https://www.npmjs.com/package/uuid-by-string
    const getUuid = require('uuid-by-string');
    const uuidHash = getUuid(`${title}${materialType}`);
    return `images/${size}/${uuidHash}`;
}

/**
 * TODO - implement
 * Return url to the image being generated.
 */
function generateUrl(path = "", filename = ""): string {
    return path;
}

/**
 * Replace in template with given values.
 * @param svg
 * @param title
 */
function replaceInSvg(svg: string, title: string): string {
    // @TODO random colors from colors
    return svg.replace("TITLE_TEMPLATE", title);
}

/**
 * helper function to read the (svg) file.
 * @returns {Promise<string>} | String
 */
async function read(materialType: string): Promise<string> {
    try {
        return await Fs.readFile(`images/template.svg`, {encoding: "utf8"});
    } catch (e) {
        console.log(`Read  failed:`, {
            error: String(e)
        });
        return "";
    }
}
