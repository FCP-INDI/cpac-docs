(function () {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (
      !h.classList.contains("scroll-up-sticky") &&
      !h.classList.contains("sticky-top") &&
      !h.classList.contains("fixed-top")
    )
      return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  // Helper to replace tree chars with spaces
  function sanitizeTreeChars(text) {
    // Replace │ and ├── and └── with spaces to indent properly in YAML
    return text
      .replace(/│/g, "    ")   // vertical bar -> 4 spaces
      .replace(/├──/g, "    ") // branch -> 4 spaces
      .replace(/└──/g, "    "); // end branch -> 4 spaces
  }

  async function loadYAML(filename) {
    if (!filename) {
      console.error("loadYAML: No filename provided.");
      return;
    }

    try {
      const response = await fetch(filename);
      const yamlText = await response.text();
      const yamlData = jsyaml.load(yamlText);

      const paragraphsContainer = document.getElementById("paragraphsContent");
      paragraphsContainer.innerHTML = "";

      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, 0);
      }
    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
    }
  }

  function readYAMLparagraphs(paragraphs, container, level = 0) {
    paragraphs.forEach((item) => {
      const section = document.createElement("div");
      section.classList.add("paragraph-section");

      if (item.paragraph) {
        let headingTag;
        if (level === 0) headingTag = "h3";
        else if (level === 1) headingTag = "h5";
        else headingTag = "h6";

        const heading = document.createElement(headingTag);
        heading.textContent = item.paragraph;
        section.appendChild(heading);
      }

      if (Array.isArray(item.details)) {
        const ul = document.createElement("ul");
        ul.classList.add("paragraph-details-list");

        item.details.forEach((detailText) => {
          const li = document.createElement("li");
          li.textContent = detailText || "(detail)";
          li.classList.add("paragraph-detail");
          ul.appendChild(li);
        });

        section.appendChild(ul);
      }

      if (Array.isArray(item.codeblocks)) {
        const codeContainer = document.createElement("div");
        codeContainer.classList.add("paragraph-codeblock");

        item.codeblocks.forEach((code) => {
          const pre = document.createElement("pre");
          const codeElem = document.createElement("code");
          codeElem.className = "language-yaml";
          codeElem.textContent = sanitizeTreeChars(code);
          pre.appendChild(codeElem);
          codeContainer.appendChild(pre);
        });
        section.appendChild(codeContainer);
      }

      if (Array.isArray(item.subparagraphs) && item.subparagraphs.length > 0) {
        const subContainer = document.createElement("div");
        subContainer.classList.add("subparagraphs-container");
        readYAMLparagraphs(item.subparagraphs, subContainer, level + 1);
        section.appendChild(subContainer);
      }

      container.appendChild(section);
    });
  }

  function renderCodeblocksFromYAML(yamlData, targetId) {
    const sectionCodeblocks = [];

    function collectCodeblocks(items) {
      items.forEach((item) => {
        if (Array.isArray(item.codeblocks)) {
          item.codeblocks.forEach((code) => sectionCodeblocks.push(code));
        }
        if (Array.isArray(item.subparagraphs)) {
          collectCodeblocks(item.subparagraphs);
        }
      });
    }

    if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
      collectCodeblocks(yamlData.paragraphs);
    }

    if (sectionCodeblocks.length > 0) {
      const codeContainer = document.getElementById(targetId);
      codeContainer.innerHTML = sectionCodeblocks
        .map((code) => `<pre><code class="language-yaml">${sanitizeTreeChars(code)}</code></pre>`)
        .join("\n");

      if (window.Prism) Prism.highlightAll(); // optional syntax highlighting
    }
  }

  window.addEventListener("load", () => {
    toggleScrolled();
    loadYAML("../assets/content/pages/use/use.yaml");
  });
})();
