import {splitString} from './svgGenerator'

const maxLength = 22;


test("very long word", () => {
    const longTitle = "dethererenmagetlangstrengpåover22tegn";
    const actual = splitString(longTitle);
    const expected = ["dethererenmagetlangst-",
        "rengpåover22tegn"]
    expect(actual).toEqual(expected);
})

test("very very long word", () => {
    const longTitle = "dethererenmagetlangstrengpåover22tegndethererenmagetlangstrengpåover22tegn";
    const actual = splitString(longTitle);
    const expected = ["dethererenmagetlangst-",
        "rengpåover22tegndethe-",
        "rerenmagetlangstrengp-",
        "åover22tegn"];
    expect(actual).toEqual(expected);
})

test("very long title", () => {
    const longTitle = "Harry potter og hemmelighedernes kammer";
    const actual = splitString(longTitle);
    const expected = ["Harry potter og hemme-",
        "lighedernes kammer"];

    expect(actual).toEqual(expected);
})

test("very long title with very long word in the end", () => {
    const longTitle = "Harry potter og hemmelighedernes kammer dethererenmagetlangstrengpåover22tegn";

    const actual = splitString(longTitle);
    const expected = ["Harry potter og hemme-",
        "lighedernes kammer de-",
        "thererenmagetlangstre-",
        "ngpåover22tegn"];

    expect(actual).toEqual(expected);
})


