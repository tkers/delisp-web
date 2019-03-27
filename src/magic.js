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

const removeFirstLine = str =>
  str
    .split("\n")
    .slice(1)
    .join("\n");

const transpile = (src, globals) => {
  const inferredModule = inferSource(src, globals);
  const jsCode = compileModuleToString(inferredModule);
  return removeFirstLine(jsCode);
};

const createJs = (code, attributes = []) => {
  const node = document.createElement("script");
  for (const attr of attributes) {
    node.setAttribute(attr.name, attr.value);
  }
  node.type = "text/javascript";
  node.innerHTML = code;
  return node;
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const scripts = document.querySelectorAll("script[type='text/delisp']");
    scripts.forEach(dlElem => {
      const options = dlElem.dataset;
      const globals =
        options.globals && options.globals.split(",").map(x => x.trim());
      const jsCode = transpile(dlElem.innerHTML, globals);
      if (!jsCode) return;
      const jsElem = createJs(jsCode, dlElem.attributes);
      dlElem.parentElement.replaceChild(jsElem, dlElem);
    });
  },
  false
);
