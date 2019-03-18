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
    showInfo(Delisp.printType(type));
  } else {
    clearStatus();
  }
}

function format() {
  editor.value = Delisp.formatSource(editor.value);
}

function compile() {
  try {
    const src = editor.value;

    const typedModule = Delisp.inferSource(src);
    showLastType(typedModule);

    const jscode = Delisp.compileSource(src);
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

  editor.addEventListener("blur", format);
  editor.addEventListener("keydown", debounce(compile));

  format();
  compile();
});
