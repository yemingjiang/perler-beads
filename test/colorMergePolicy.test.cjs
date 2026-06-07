const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = require('node:fs').readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  module._compile(output.outputText, filename);
};

const {
  canColorAbsorbSimilarColor,
  isProtectedMergeTarget,
} = require(path.join(__dirname, '../src/utils/colorMergePolicy.ts'));

test('near-white and transparent colors cannot absorb other colors when protection is enabled', () => {
  assert.equal(
    canColorAbsorbSimilarColor(
      { key: '#FCF7F8', hex: '#FCF7F8', rgb: { r: 252, g: 247, b: 248 } },
      true
    ),
    false
  );
  assert.equal(
    canColorAbsorbSimilarColor(
      { key: 'ERASE', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } },
      true
    ),
    false
  );
});

test('normal colors can still absorb similar lower-frequency colors', () => {
  assert.equal(
    canColorAbsorbSimilarColor(
      { key: '#1C9C4F', hex: '#1C9C4F', rgb: { r: 28, g: 156, b: 79 } },
      true
    ),
    true
  );
});

test('protection can be disabled to preserve the original merge behavior', () => {
  assert.equal(
    canColorAbsorbSimilarColor(
      { key: '#FCF7F8', hex: '#FCF7F8', rgb: { r: 252, g: 247, b: 248 } },
      false
    ),
    true
  );
});

test('protected targets include known white background colors', () => {
  assert.equal(isProtectedMergeTarget({ key: '#FFFFFF', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } }), true);
  assert.equal(isProtectedMergeTarget({ key: '#FEFFFF', hex: '#FEFFFF', rgb: { r: 254, g: 255, b: 255 } }), true);
  assert.equal(isProtectedMergeTarget({ key: '#9BB13A', hex: '#9BB13A', rgb: { r: 155, g: 177, b: 58 } }), false);
});
