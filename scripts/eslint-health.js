#!/usr/bin/env node

/**
 * Fail with an error message if this project has too many ESLint problems.
 *
 * Configuration options:
 *
 *    config.maxProblems: The maximum number of problems that should be allowed.
 *                        If the number of problems exceeds this value, the
 *                        script will fail with an error message. Consider
 *                        lowering this number over time, as problems are fixed,
 *                        to prevent regressions.
 *
 *    config.runFrom:     The directory that ESLint should be run from. Usually,
 *                        this should be the directory that contains your ESLint
 *                        configuration files, which is usually the project
 *                        root. The default is the directory that the script is
 *                        saved to. In other words, the default assumes that
 *                        this file is saved to the project root. If you saved
 *                        this file to a "scripts" directory, change the value
 *                        to path.join(__dirname, "..") to run ESLint from one
 *                        level up.
 *
 *    config.targets:     The targets to run ESLint against. By default, ESLint
 *                        will be run against all files in or below the
 *                        "config.runFrom" directory which end with a .js
 *                        extension or which match a pattern listed in the
 *                        "overrides" section of the ESLint config. These should
 *                        probably be the same targets that you specify in your
 *                        "lint" npm script if you have one.
 *
 * This is a copy of the following Gist:
 * https://gist.github.com/openjck/043e198f5e0988634793ced4359f8710
 *
 * More information:
 * https://medium.com/reflections-on-building-software/gradually-reduce-the-number-of-eslint-problems-in-your-codebase-fe503d4f2716
 */

/* eslint-disable no-console */

const { ESLint } = require('eslint');
const path = require('path');

const config = {
  maxProblems: 17,
  runFrom: path.join(__dirname, '..'),
  targets: ['.'],
};

(async function main() {
  console.log('Running johnbot...');
  console.log();

  const eslint = new ESLint();
  const results = await eslint.lintFiles(config.targets);
  const numProblems = results.reduce((acc, result) => {
    return acc + result.errorCount + result.warningCount;
  }, 0);

  console.log(`Max ESLint problems: ${config.maxProblems}`);
  console.log(`Num ESLint problems: ${numProblems}`);
  console.log();

  if (numProblems === 0) {
    console.log('PASS: No ESLint problems!');
    console.log(
      "NOTE: Congratulations! You don't need this script any more. Consider removing\n      it and running ESLint directly instead."
    );
  } else if (numProblems <= config.maxProblems) {
    console.log('PASS: Number of ESLint problems <= max');
    if (numProblems < config.maxProblems) {
      console.log(
        `NOTE: Consider lowering config.maxProblems to ${numProblems} in the\n      eslint-health script to prevent regressions`
      );
    }
  } else {
    console.error('FAIL: Number of ESLint problems > max');
    console.error(
      'NOTE: Recent changes may have introduced new ESLint problems'
    );
    process.exitCode = 1;
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
