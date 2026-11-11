// Copies the version in package.json into the element's VERSION constant.
//
//   node util/sync-version.js          rewrites src/vcf-lookup-field.js
//   node util/sync-version.js --check  fails when the two differ
//
// `npm version` runs the first form (the "version" script), so both files
// change in the same commit; `prepublishOnly` runs the second.
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const { version } = require('../package.json');
const srcPath = resolve(__dirname, '../src/vcf-lookup-field.js');
const versionRegex = /^const VERSION = '([^']*)';$/m;

const source = readFileSync(srcPath, 'utf8');
const match = versionRegex.exec(source);
if (!match) {
  console.error(`No "const VERSION = '…';" line in ${srcPath}`);
  process.exit(1);
}

if (process.argv.includes('--check')) {
  if (match[1] !== version) {
    console.error(`src/vcf-lookup-field.js has version ${match[1]}, package.json has ${version}.`);
    process.exit(1);
  }
} else if (match[1] !== version) {
  writeFileSync(srcPath, source.replace(versionRegex, `const VERSION = '${version}';`));
}
