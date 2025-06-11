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

      const paragraphsContainer = document.getElementById("paragraphsContent");
      const mermaidContainer = document.getElementById("operationsContent");

      if (!paragraphsContainer || !mermaidContainer) {
        console.error("Required content containers are missing in the DOM.");
        return;
      }

      paragraphsContainer.innerHTML = "";
      mermaidContainer.innerHTML = "";

      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer);
      }

      if (yamlData.mermaid) {
        renderMermaidFromYAML(yamlData.mermaid, mermaidContainer);
      }

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      if (container) {
        container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
      }
    }
  }

  function readYAMLparagraphs(contentData, container) {
    contentData.forEach((item) => {
      const section = document.createElement("div");
      section.classList.add("paragraph-section");

      const title = document.createElement("h3");
      title.textContent = item.title;
      section.appendChild(title);

      if (Array.isArray(item.paragraphs)) {
        item.paragraphs.forEach((paraText) => {
          const para = document.createElement("p");
          para.textContent = paraText;
          section.appendChild(para);
        });
      } else {
        const para = document.createElement("p");
        para.textContent = item.paragraphs || "";
        section.appendChild(para);
      }

      container.appendChild(section);
    });
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

  async function dropdown(yamlFile = "../assets/content/pages/support/support.yaml") {
    try {
      const response = await fetch(yamlFile);
      const yamlText = await response.text();
      const yamlData = jsyaml.load(yamlText);

      if (!yamlData.dropdown || !Array.isArray(yamlData.dropdown)) {
        console.warn("No valid dropdown data found in YAML.");
        return;
      }

      const dropdownContainer = document.querySelector("dropdown");
      if (!dropdownContainer) {
        console.error("<dropdown> element not found in HTML.");
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "dropdown-wrapper";

      yamlData.dropdown.forEach((item, index) => {
        const details = document.createElement("details");
        details.className = "dropdown-item";

        const summary = document.createElement("summary");
        summary.textContent = item.dropdown_title || `Item ${index + 1}`;
        details.appendChild(summary);

        if (Array.isArray(item.dropdown_details)) {
          const list = document.createElement("ul");
          item.dropdown_details.forEach((detail) => {
            const li = document.createElement("li");
            li.textContent = detail;
            list.appendChild(li);
          });
          details.appendChild(list);
        }

        wrapper.appendChild(details);
      });

      dropdownContainer.innerHTML = "";
      dropdownContainer.appendChild(wrapper);

    } catch (error) {
      console.error(`Error rendering dropdown from ${yamlFile}:`, error);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: false });
  });

  window.addEventListener("load", function () {
    toggleScrolled();
    loadYAML("../assets/content/pages/support/support.yaml");
    dropdown();
  });
})();
