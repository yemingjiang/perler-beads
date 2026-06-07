import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const root = process.cwd();
const sourcePath = resolve(root, 'src/utils/palettePresets.ts');
const source = readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

const moduleShim = { exports: {} };
new Function('exports', 'module', 'require', compiled)(
  moduleShim.exports,
  moduleShim,
  require
);

const {
  MARD_221_SERIES,
  createMard221Selections,
  isMard221ColorKey,
} = moduleShim.exports;

const mapping = JSON.parse(
  readFileSync(resolve(root, 'src/app/colorSystemMapping.json'), 'utf8')
);

const allColors = Object.keys(mapping).map((hex) => ({ key: hex, hex }));
const selections = createMard221Selections(
  allColors,
  (hex) => mapping[hex.toUpperCase()]?.MARD ?? '?'
);

const selectedHexes = Object.entries(selections)
  .filter(([, isSelected]) => isSelected)
  .map(([hex]) => hex);

assert.deepEqual(MARD_221_SERIES, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M']);
assert.equal(selectedHexes.length, 221);
assert.equal(isMard221ColorKey('A01'), true);
assert.equal(isMard221ColorKey('H23'), true);
assert.equal(isMard221ColorKey('M15'), true);
assert.equal(isMard221ColorKey('P01'), false);
assert.equal(isMard221ColorKey('R01'), false);
assert.equal(isMard221ColorKey('ZG1'), false);

const selectedCountsBySeries = {};
for (const hex of selectedHexes) {
  const series = mapping[hex].MARD.match(/^[A-Z]+/)?.[0];
  selectedCountsBySeries[series] = (selectedCountsBySeries[series] ?? 0) + 1;
}

assert.deepEqual(selectedCountsBySeries, {
  A: 26,
  B: 32,
  C: 29,
  D: 26,
  E: 24,
  F: 25,
  G: 21,
  H: 23,
  M: 15,
});

console.log('MARD 221 preset verified.');
