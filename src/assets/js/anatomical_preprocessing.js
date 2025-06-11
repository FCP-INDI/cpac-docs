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

      const dropdownContainer = document.querySelector("dropdown");

      if (!dropdownContainer) {
        console.error("<dropdown> element not found in HTML.");
        return;
      }

      dropdownContainer.innerHTML = ""; // Clear existing content

      // Create a wrapper to apply the dropdown styling
      const wrapper = document.createElement("div");
      wrapper.classList.add("dropdown-wrapper");

      if (yamlData.steps) {
        renderNodeblockSteps(yamlData.steps, wrapper);
      }

      dropdownContainer.appendChild(wrapper); // Append wrapper to dropdown

      // Initialize mermaid diagrams after adding them to the DOM
      mermaid.init();

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.querySelector("dropdown");
      if (container) {
        container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
      }
    }
  }

  function renderNodeblockSteps(steps, container) {
    Object.entries(steps).forEach(([stepName, stepData]) => {
      const stepDiv = document.createElement("div");
      stepDiv.classList.add("dropdown-item"); // Add the dropdown-item class for styling

      // Create dropdown for each step
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const strongTitle = document.createElement("strong");
      strongTitle.textContent = stepName;
      summary.appendChild(strongTitle);
      details.appendChild(summary);

      // Add description to the dropdown
      if (stepData.description) {
        const descEl = renderDescription(stepData.description);
        details.appendChild(descEl);
      }

      if (stepData.methods) {
        Object.entries(stepData.methods).forEach(([methodName, methodData]) => {
          const methodDiv = document.createElement("div");
          methodDiv.classList.add("method-section");

          const methodHeader = document.createElement("h5");
          methodHeader.textContent = methodName;
          methodDiv.appendChild(methodHeader);

          if (methodData.description) {
            const descEl = renderDescription(methodData.description);
            methodDiv.appendChild(descEl);
          }

          if (methodData.operations) {
            const mermaidDiv = document.createElement("div");
            mermaidDiv.classList.add("mermaid");
            mermaidDiv.textContent = methodData.operations; // Add Mermaid diagram text
            mermaidDiv.style.paddingBottom = "20px";
            methodDiv.appendChild(mermaidDiv);
          }

          details.appendChild(methodDiv);
        });
      }

      stepDiv.appendChild(details);
      container.appendChild(stepDiv);
    });
  }

  function renderDescription(desc) {
    if (Array.isArray(desc)) {
      const ul = document.createElement("ul");
      desc.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      return ul;
    } else {
      const p = document.createElement("p");
      p.textContent = desc;
      return p;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: false });
  });

  window.addEventListener("load", () => {
    toggleScrolled();
    loadYAML("../../assets/content/pages/neuroimaging/nodeblock_descriptors/anatomical_preprocessing.yaml");
  });
})();
