import { inferSource, compileSource, formatSource, printType } from "./delisp";

let editor, viewer, statusbar;

function nl2br(str) {
  return str && str.replace(/(?:\r\n|\r|\n)/g, "<br>");
}

const patterns = [
  [/(".+?")/g, '<span class="lit-string">$1</span>'],
  [/\b([0-9]+)\b/g, '<span class="lit-number">$1</span>'],
  [
    /\b(define\s+?)(.+?\s+?)/g,
    '<span class="special">$1</span><span class="definition">$2</span>'
  ],
  [/\b(lambda|export|the|type)\b/g, '<span class="special">$1</span>'],
  [/(\s|\(|\{)(:.+?)\b/g, '$1<span class="keyword">$2</span>']
];

function highlight(str) {
  return (
    str && patterns.reduce((marked, pat) => marked.replace(pat[0], pat[1]), str)
  );
}

function debounce(fn, delay = 100) {
  let timer;
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  };
}

function autoGrow() {
  if (editor.clientHeight < editor.scrollHeight) {
    editor.style.height = editor.scrollHeight + "px";
    if (editor.clientHeight < editor.scrollHeight) {
      editor.style.height =
        editor.scrollHeight * 2 - editor.clientHeight + "px";
    }
  }
  viewer.style.height = editor.style.height;
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

const doCompile = debounce(() => {
  const src = editor.value;
  try {
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
}, 100);

const doUpdateQuery = debounce(() => {
  const code = editor.value;
  const params = new URLSearchParams(window.location.search);
  params.set("code", btoa(code));
  const query = window.location.pathname + "?" + params.toString();
  history.pushState(null, "", query);
}, 100);

function doFormat() {
  editor.value = formatSource(editor.value);
}

function updateEditorView() {
  viewer.innerHTML = highlight(editor.value);
  autoGrow();
}

function handleBlur() {
  doFormat();
  updateEditorView();
}

function handleInput() {
  updateEditorView();
  doCompile();
  doUpdateQuery();
}

window.addEventListener("load", () => {
  editor = document.getElementById("code-input");
  viewer = document.getElementById("code-view");
  statusbar = document.getElementById("statusbar");

  editor.addEventListener("blur", handleBlur);
  editor.addEventListener("input", handleInput);

  try {
    const params = new URLSearchParams(window.location.search);
    const bcode = params.get("code");
    const code = bcode && atob(bcode);
    if (code) {
      editor.textContent = code;
    }
  } catch {}

  doFormat();
  updateEditorView();
  doCompile();
});
