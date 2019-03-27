// create a new JS script node
const createScript = code => {
  const node = document.createElement("script");
  node.type = "text/javascript";
  node.text = code;
  return node;
};

// replaces a node with a new JS script node
const replaceScript = (code, oldNode) => {
  const node = createScript(code);
  oldNode.parentElement.replaceChild(node, oldNode);
};

// for all scripts: load src, transform to JS, insert in DOM
const loadScripts = (scripts, transform) => {
  const run = () => {
    for (const s of scripts) {
      if (s.isLoading && !s.isAsync) {
        break;
      } else if (!s.isLoading && !s.isDone) {
        s.isDone = true;
        const jsCode = transform(s.content, s.element);
        replaceScript(jsCode, s.element);
      }
    }
  };

  scripts
    .filter(s => !!s.src)
    .forEach(s => {
      fetch(s.src)
        .then(r => r.text())
        .then(content => {
          s.content = content;
          s.isLoading = false;
          run();
        })
        .catch(ex => {
          console.error(ex.message);
          s.isDone = true;
          s.isLoading = false;
          run();
        });
    });

  run();
};

// find all scripts and run as JS
const snazzy = (type, transform) => {
  let scripts = [];
  const elements = document.getElementsByTagName("script");
  for (let i = 0; i < elements.length; i++) {
    const elem = elements.item(i);
    if (elem.type !== type) continue;

    scripts.push({
      element: elem,
      src: elem.src,
      content: elem.src ? null : elem.innerHTML,
      isAsync: elem.hasAttribute("async"),
      isLoading: !!elem.src,
      isDone: false
    });
  }

  loadScripts(scripts, transform);
};

export default snazzy;
