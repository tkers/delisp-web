import {
  inferSource,
  findTypeAtRange,
  compileSource,
  formatSource,
  printType
} from "./delisp";

let editor, viewer, statusbar;
let typedModule, cursorStart, cursorEnd;

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

function showCursorType() {
  if (!typedModule) return;

  const pos = getCursorPos(editor);
  if (pos.start === cursorStart && pos.end === cursorEnd) return;
  cursorStart = pos.start;
  cursorEnd = pos.end;

  try {
    const type = findTypeAtRange(typedModule, cursorStart, cursorEnd);
    if (type) {
      showInfo(printType(type));
    } else {
      clearStatus();
    }
  } catch (ex) {
    if (ex.isWarning) {
      showWarn(ex.message);
    } else {
      showError(ex.message);
    }
  }
}

const doCompile = debounce(() => {
  const src = editor.value;
  try {
    typedModule = inferSource(src);
    const jscode = compileSource(src);
    document.getElementById("jscode").textContent = jscode;
  } catch (ex) {
    typedModule = null;
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

function getCursorPos(input) {
  if ("selectionStart" in input && document.activeElement == input) {
    return {
      start: input.selectionStart,
      end: input.selectionEnd
    };
  } else if (input.createTextRange) {
    var sel = document.selection.createRange();
    if (sel.parentElement() === input) {
      var rng = input.createTextRange();
      rng.moveToBookmark(sel.getBookmark());
      for (
        var len = 0;
        rng.compareEndPoints("EndToStart", rng) > 0;
        rng.moveEnd("character", -1)
      ) {
        len++;
      }
      rng.setEndPoint("StartToStart", input.createTextRange());
      for (
        var pos = { start: 0, end: len };
        rng.compareEndPoints("EndToStart", rng) > 0;
        rng.moveEnd("character", -1)
      ) {
        pos.start++;
        pos.end++;
      }
      return pos;
    }
  }
  return -1;
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

  setInterval(() => {
    showCursorType();
  }, 100);
});
