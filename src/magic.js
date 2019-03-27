import snazzy from "./snazzy";
import {
  readModule,
  inferModule,
  compileModuleToString,
  printHighlightedExpr,
  printType
} from "../../delisp/packages/delisp-core";

const inferSource = (src, globals = []) => {
  const syntax = readModule(src);
  const { unknowns, typedModule } = inferModule(syntax);

  const reallyUnknowns = unknowns.filter(u => globals.indexOf(u.name) === -1);
  if (reallyUnknowns.length > 0) {
    const msgs = reallyUnknowns.map(u =>
      printHighlightedExpr(
        `Unknown variable ${u.name} of type ${printType(u.info.type)}`,
        u.location
      )
    );
    throw new Error(msgs.join("\n\n"));
  }

  return typedModule;
};

// remove the require("@delisp/runtime")
const removeFirstLine = str =>
  str
    .split("\n")
    .slice(1)
    .join("\n");

// get the list of global identifiers from the script attribute
const getGlobals = elem => {
  const globals = elem.getAttribute("data-globals");
  return globals ? globals.split(",").map(x => x.trim()) : [];
};

// transforms the given source to JS
const transformDelisp = (src, elem) => {
  const globals = getGlobals(elem);
  const inferredModule = inferSource(src, globals);
  const js = compileModuleToString(inferredModule);
  return removeFirstLine(js);
};

const init = () => {
  snazzy("text/delisp", transformDelisp);
};

document.addEventListener("DOMContentLoaded", init, false);
