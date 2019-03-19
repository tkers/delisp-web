import {
  readModule,
  inferModule,
  compileModuleToString,
  pprintModule,
  printType,
  printHighlightedExpr
} from "@delisp/core";

export { printType };

export const inferSource = src => {
  const syntax = readModule(src);
  const { unknowns, typedModule } = inferModule(syntax);

  if (unknowns.length > 0) {
    const warnings = unknowns.map(u =>
      printHighlightedExpr(
        `Unknown variable ${u.name} of type ${printType(u.info.type)}`,
        u.location
      )
    );
    const err = new Error(warnings.join("\n\n"));
    err.isWarning = true;
    throw err;
  }

  return typedModule;
};

export const compileSource = src => {
  const syntax = readModule(src);
  return compileModuleToString(syntax, "", true);
};

export const formatSource = (src, w = 40) => {
  return pprintModule(readModule(src), w);
};
