import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import minify from "rollup-plugin-babel-minify";

export default {
  input: "src/index.js",
  output: {
    file: "dist/app.js",
    format: "iife"
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    json(),
    globals(),
    builtins(),
    minify({ comments: false })
  ]
};
