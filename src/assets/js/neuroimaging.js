(function () {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (!h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  async function loadYAML(filename) {
    if (!filename) {
      console.error("loadYAML: No filename provided.");
      return;
    }

    try {
      const response = await fetch(filename);
      const yamlText = await response.text();
      const yamlData = jsyaml.load(yamlText);

      const mermaidContainer = document.getElementById("operationsContent");

      mermaidContainer.innerHTML = "";

      if (yamlData.mermaid) {
        renderMermaidFromYAML(yamlData.mermaid, mermaidContainer);
      }

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
    }
  }

  function renderMermaidFromYAML(mermaidData, container) {
    if (!mermaidData || !mermaidData.operations) {
      console.error("renderMermaidFromYAML: Invalid mermaid data format.");
      return;
    }

    if (mermaidData.title) {
      const title = document.createElement("h4");
      title.textContent = mermaidData.title;
      container.appendChild(title);
    }

    const mermaidDiagram = document.createElement("div");
    mermaidDiagram.classList.add("mermaid");
    mermaidDiagram.textContent = mermaidData.operations;

    container.appendChild(mermaidDiagram);

    mermaid.init(undefined, mermaidDiagram);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: false });
  });

  window.addEventListener("load", function () {
    toggleScrolled();
    loadYAML("../assets/content/pages/neuroimaging/neuroimaging.yaml");
  });
})();
