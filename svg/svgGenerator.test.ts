import { canSplitAtPos, splitString } from "./svgGenerator";

test("very long word", () => {
  const longTitle = "dethererenmagetlangstrengpåover22tegn";
  const actual = splitString(longTitle, 10, 15, 4);
  const expected = ["dethererenmaget-", "langstrengpåove-", "r22tegn"];
  expect(actual).toEqual(expected);
});

test("very very long word", () => {
  const longTitle =
    "dethererenmagetlangstrengpåover22tegndethererenmagetlangstrengpåover22tegn";
  const actual = splitString(longTitle, 10, 15, 4);
  const expected = [
    "dethererenmaget-",
    "langstrengpåove-",
    "r22tegndetherer-",
    "enmagetlangst...",
  ];
  expect(actual).toEqual(expected);
});

test("very long title with very long word in the end", () => {
  const longTitle =
    "Harry potter og hemmelighedernes kammer dethererenmagetlangstrengpåover22tegn";

  const actual = splitString(longTitle, 10, 15, 4);
  const expected = [
    "Harry potter og",
    "hemmelighederne-",
    "s kammer",
    "dethererenmag...",
  ];

  expect(actual).toEqual(expected);
});

test("very long title with very long word in the end, two lines", () => {
  const longTitle =
    "Harry potter og hemmelighedernes kammer dethererenmagetlangstrengpåover22tegn";

  const actual = splitString(longTitle, 10, 15, 2);
  const expected = ["Harry potter og", "hemmeligheder..."];

  expect(actual).toEqual(expected);
});

test("short title is on single line", () => {
  const title = "Gormenghast";

  const actual = splitString(title, 10, 15, 4);
  const expected = ["Harry pot-", "ter og hem-", "meligheder-", "nes kammer"];

  expect(actual).toEqual(["Gormenghast"]);
});

test("Seen in the wild", () => {
  expect(splitString("Emballagefri supermarkeder", 15, 15, 4)).toEqual([
    "Emballagefri",
    "supermarkeder",
  ]);

  expect(splitString("Skal du have dårlig", 15, 15, 4)).toEqual([
    "Skal du have",
    "dårlig",
  ]);

  expect(splitString("Miljøforskere blah at milliarder", 15, 15, 4)).toEqual([
    "Miljøforskere",
    "blah at",
    "milliarder",
  ]);

  expect(
    splitString("Miljøforskere blah at milliarder", 15, 15, 4, 15)
  ).toEqual(["Miljøforskere", "blah at", "milliarder"]);

  expect(splitString("Psykopaten på den hvide hest", 15, 15, 4)).toEqual([
    "Psykopaten på",
    "den hvide hest",
  ]);

  expect(
    splitString("harry potter og hemmlighedernes kammer", 15, 15, 4, 15)
  ).toEqual(["harry potter og", "hemmlighedernes", "kammer"]);

  // Prefer to split at "-"
  expect(
    splitString(
      "Historiens største e-sportssatsning kan floppe fælt",
      15,
      15,
      4,
      15
    )
  ).toEqual(["Historiens", "største e-", "sportssatsning", "kan floppe fælt"]);
});
test("rules for word splitting", () => {
  expect(canSplitAtPos("målingerne", 1)).toEqual(false); // m-ålingerne - Der er ingen vokal på venstre side + mindst 3 karakterer
  expect(canSplitAtPos("målingerne", 2)).toEqual(false); // må-lingerne - Vi vil have mindst 3 karakterer på hver side
  expect(canSplitAtPos("målingerne", 3)).toEqual(true); // mål-ingerne - Fin
  expect(canSplitAtPos("målingerne", 4)).toEqual(false); // måli-ngerne - Ugyldig start-konsonantforbindelse "ng"
  expect(canSplitAtPos("målingerne", 5)).toEqual(true); // målin-gerne - Fin

  expect(canSplitAtPos("forvitring", 7)).toEqual(false); // forvitr-ing - Ugyldig slut-konsonantforbindelse "tr"

  expect(canSplitAtPos("hej målingerne der", 5)).toEqual(false); // m-ålingerne - Der er ingen vokal på venstre side
  expect(canSplitAtPos("hej målingern der", 12)).toEqual(false); // målinger-n - Der er ingen vokal på højre side
});
