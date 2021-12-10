/* eslint-disable no-console */
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

async function testRunner() {
  const testFiles = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file !== 'mocha.js' && (file.endsWith('.js') || file.endsWith('.ts'))
    )
    .map((file) => path.join(__dirname, file));

  const mocha = new Mocha();
  testFiles.forEach((file) => mocha.addFile(file));

  mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0;
  });
}

testRunner().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
