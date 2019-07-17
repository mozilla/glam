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

let fnName = null;
files.forEach(fnFile => {
  fnName = camelCase(
    fnFile
      .slice(0, -6)  // Strip off '.fn.js'
      .split("/")
      .join("_")
  );

  if ((process.env.FUNCTION_NAME || fnName) === fnName) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    exports[fnName] = require(fnFile);
  }
});
