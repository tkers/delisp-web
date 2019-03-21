import {
  readModule,
  inferModule,
  compileModuleToString,
  findSyntaxByRange,
  pprintModule,
  printType,
  printHighlightedExpr,
  isExpression,
  isTypeAlias,
  isDefinition,
  isExport
} from "../../delisp/packages/delisp-core";

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

export const findTypeAtRange = (typedModule, cursorStart, cursorEnd) => {
  const s = findSyntaxByRange(typedModule, cursorStart, cursorEnd);
  if (!s) {
    return;
  }
  if (isExpression(s)) {
    return s.info.type;
  } else if (isTypeAlias(s)) {
    return s;
  } else if (isDefinition(s)) {
    return s.value.info.type;
  } else if (isExport(s)) {
    return s.value.info.type;
  }
};
