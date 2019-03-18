import { inferSource, compileSource, formatSource, printType } from "./delisp";

let editor, statusbar;

function debounce(fn, delay = 100) {
  let timer;
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  };
}

function clearStatus() {
  statusbar.className = "hidden";
  statusbar.textContent = "";
}

function showError(msg) {
  statusbar.className = "error";
  statusbar.textContent = msg;
}

function showWarn(msg) {
  statusbar.className = "warn";
  statusbar.textContent = msg;
}

function showInfo(msg) {
  statusbar.className = "info";
  statusbar.textContent = msg;
}

function showLastType(typedModule) {
  if (typedModule.body.length === 0) {
    clearStatus();
    return;
  }

  let sntx = typedModule.body[typedModule.body.length - 1];
  if (sntx.type === "definition") {
    sntx = sntx.value;
  }
  const type = sntx.info && sntx.info.type;
  if (type) {
    showInfo(printType(type));
  } else {
    clearStatus();
  }
}

function doFormat() {
  editor.value = formatSource(editor.value);
}

function doRun() {
  try {
    const src = editor.value;

    const typedModule = inferSource(src);
    showLastType(typedModule);

    const jscode = compileSource(src);
    document.getElementById("jscode").textContent = jscode;
  } catch (ex) {
    if (ex.isWarning) {
      showWarn(ex.message);
    } else {
      showError(ex.message);
    }
  }
}

window.addEventListener("load", () => {
  editor = document.getElementById("editor");
  statusbar = document.getElementById("statusbar");

  editor.addEventListener("blur", doFormat);
  editor.addEventListener("keydown", debounce(doRun));

  doFormat();
  doRun();
});
