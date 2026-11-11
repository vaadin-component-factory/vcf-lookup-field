// npm run publish -- <version>
//
// Sets the version, pushes the version commit and tag, and publishes to npm
// and GitHub Packages. `npm version` also updates the element's VERSION
// constant through the "version" script.
//
// Every step is skipped when it is already done, so the script can be run
// again with the same version after a step failed.
const { execSync } = require('child_process');
const { name, version: currentVersion } = require('../package.json');

const version = process.argv[2];
const semverRegex = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;

// "publish" is also npm's post-publish hook, so a plain `npm publish` runs this
// without a version: nothing to do then.
if (!version) {
  process.exit(0);
}

if (!semverRegex.test(version)) {
  console.error('Please enter a semantic version (e.g. 1.0.0).');
  process.exit(1);
}

const run = command => execSync(command, { stdio: 'inherit' });
const read = command =>
  execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();

const tag = `v${version}`;
const registries = ['https://registry.npmjs.org/', 'https://npm.pkg.github.com/vaadin-component-factory'];

/** True when this version is already in the registry. A failed lookup counts as not published. */
const isPublished = registry => {
  try {
    return read(`npm view ${name}@${version} version --registry ${registry}`) === version;
  } catch (e) {
    return false;
  }
};

if (currentVersion === version) {
  // package.json already has the version, which `npm version` refuses to set
  // again: only the tag is missing.
  run('node util/sync-version.js --check');
  if (!read(`git tag -l ${tag}`)) {
    run(`git tag ${tag}`);
  }
} else {
  run(`npm version ${version} -m "v%s"`);
}

// Pushed before publishing, so a published version always has its commit and tag.
run('git push');
run(`git push origin ${tag}`);

registries.forEach(registry => {
  if (isPublished(registry)) {
    console.log(`${name}@${version} is already published to ${registry}`);
  } else {
    run(`npm publish --registry ${registry}`);
  }
});
