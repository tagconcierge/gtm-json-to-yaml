const fs = require('node:fs');
const { expect, test, setSystemTime } = require("bun:test");

const { yamlToGtmJson, gtmJsonToYaml } = require('./index');

const test1exampleGtmJson = JSON.parse(fs.readFileSync("tests/fixtures/test1-export.json").toString());
const test1resultYaml = fs.readFileSync("tests/test1-result.yaml").toString();

const test2exampleYaml = fs.readFileSync("tests/fixtures/test2-import.yaml").toString();
const test2resultGtmJson = fs.readFileSync("tests/test2-result.json").toString();


test("gtmJsonToYaml parsing exported GTM JSON", () => {
  expect(gtmJsonToYaml(test1exampleGtmJson)).toBe(test1resultYaml);
});


test("yamlToGtmJson preparing GTM JSON to import", () => {
  const date = new Date("2024-01-12T22:51:47.000Z");
  setSystemTime(date);
  expect(JSON.stringify(yamlToGtmJson(test2exampleYaml))).toBe(test2resultGtmJson);
});
