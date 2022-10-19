import {promises as Fs} from "fs";

export async function generate(title: string): Promise<string> {
    let svgAsString = await read();
    return replaceInSvg(svgAsString, title);
}

function replaceInSvg(svg:string, title: string): string {
    return svg.replace("TITLE_TEMPLATE", title);
}

/**
 * helper function to read the file
 * @returns {Promise<string>} | String
 */
async function read() {
    try {
        return await Fs.readFile("svg/template.svg", {encoding: "utf8"});
    } catch (e) {
        console.log(`Read  failed:`, {
            error: String(e)
        });
        return "";
    }
}
