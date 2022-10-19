import {promises as Fs} from "fs";


/**
 * Generate an image from given parameter.
 * @param svgString
 */
export function svg2Image(svgString: Buffer): void {
    // @TODO filename -- some kind of uid
    const sharp = require("sharp")
    sharp(svgString)
        .png()
        .toFile('images/output.png', (err: any, info: any) => {
            console.log(info)
        });
}


/**
 * Generate a file. Return url to file.
 * @param title
 */
export async function generate(title: string, materialType: string): Promise<String> {
    let svgAsString = await read();
    const buf = Buffer.from(replaceInSvg(svgAsString, title));
    svg2Image(buf);
    return generateUrl();
}

/**
 * TODO - implement
 */
function generateUrl(path = "", filename = ""): string {
    return "url";
}

/**
 * Replace in template with given values.
 * @param svg
 * @param title
 */
function replaceInSvg(svg: string, title: string): string {
    return svg.replace("TITLE_TEMPLATE", title);
}

/**
 * helper function to read the (svg) file.
 * @returns {Promise<string>} | String
 */
async function read(): Promise<string> {
    try {
        return await Fs.readFile("images/template.svg", {encoding: "utf8"});
    } catch (e) {
        console.log(`Read  failed:`, {
            error: String(e)
        });
        return "";
    }
}
