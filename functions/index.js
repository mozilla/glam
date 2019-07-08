'use strict';

/**
 *   Loads all `.fn.js` files and exports a cloud function matching the
 *   camelcased file name.
 *
 *   Based on this thread:
 *     https://github.com/firebase/functions-samples/issues/170
 * 
 */
const glob = require("glob");
const camelCase = require("camelcase");


const files = glob.sync("./**/*.fn.js", {
  cwd: __dirname,
  ignore: "./node_modules/**"
});

files.forEach(fnFile => {
  let fnName = camelCase(
    fnFile
      .slice(0, -6)  // Strip off '.fn.js'
      .split("/")
      .join("_")
  );

  if ((process.env.FUNCTION_NAME || fnName) === fnName) {
    exports[fnName] = require(fnFile);
  }
});
