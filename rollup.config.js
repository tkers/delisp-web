import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import minify from "rollup-plugin-babel-minify";

export default {
  input: "src/delisp.js",
  output: {
    file: "dist/delisp.js",
    format: "iife",
    name: "Delisp"
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    globals(),
    builtins(),
    minify({ comments: false })
  ]
};
