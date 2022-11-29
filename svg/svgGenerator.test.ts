import { splitString } from "./svgGenerator";

const maxLength = 22;

test("very long word", () => {
  const longTitle = "dethererenmagetlangstrengpåover22tegn";
  const actual = splitString(longTitle);
  const expected = ["dethererenmaget-", "langstrengpåove-", "r22tegn"];
  expect(actual).toEqual(expected);
});

test("very very long word", () => {
  const longTitle =
    "dethererenmagetlangstrengpåover22tegndethererenmagetlangstrengpåover22tegn";
  const actual = splitString(longTitle);
  const expected = [
    "dethererenmaget-",
    "langstrengpåove-",
    "r22tegndetherer-",
    "...",
  ];
  expect(actual).toEqual(expected);
});

test("very long title", () => {
  const longTitle = "Harry potter og hemmelighedernes kammer";
  const actual = splitString(longTitle);
  const expected = ["Harry potter og-", " hemmelighedern-", "es kammer"];

  expect(actual).toEqual(expected);
});

test("very long title with very long word in the end", () => {
  const longTitle =
    "Harry potter og hemmelighedernes kammer dethererenmagetlangstrengpåover22tegn";

  const actual = splitString(longTitle);
  const expected = [
    "Harry potter og-",
    " hemmelighedern-",
    "es kammer dethe-",
    "...",
  ];

  expect(actual).toEqual(expected);
});
