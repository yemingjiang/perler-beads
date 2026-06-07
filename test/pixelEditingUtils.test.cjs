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
  applyBackgroundColorFilters,
  recalculateColorStats,
} = require(path.join(__dirname, '../src/utils/pixelEditingUtils.ts'));

test('background color filters mark matching visible cells as external and remove them from stats', () => {
  const pixels = [
    [
      { key: '#FFFFFF', color: '#FFFFFF', isExternal: true },
      { key: '#00AA00', color: '#00AA00', isExternal: false },
    ],
    [
      { key: '#00AA00', color: '#00AA00', isExternal: false },
      { key: '#CC0000', color: '#CC0000', isExternal: false },
    ],
  ];

  const filtered = applyBackgroundColorFilters(pixels, new Set(['#00aa00']));
  const stats = recalculateColorStats(filtered);

  assert.equal(filtered[0][1].isExternal, true);
  assert.equal(filtered[0][1].isFilteredBackground, true);
  assert.equal(filtered[1][0].isExternal, true);
  assert.equal(filtered[1][0].isFilteredBackground, true);
  assert.deepEqual(Object.keys(stats.colorCounts), ['#CC0000']);
  assert.equal(stats.totalCount, 1);
});

test('clearing a background color filter restores only cells marked by the filter', () => {
  const pixels = [
    [
      { key: '#FFFFFF', color: '#FFFFFF', isExternal: true },
      { key: '#00AA00', color: '#00AA00', isExternal: true, isFilteredBackground: true },
    ],
  ];

  const restored = applyBackgroundColorFilters(pixels, new Set());

  assert.equal(restored[0][0].isExternal, true);
  assert.equal(restored[0][0].isFilteredBackground, undefined);
  assert.equal(restored[0][1].isExternal, false);
  assert.equal(restored[0][1].isFilteredBackground, undefined);
});
