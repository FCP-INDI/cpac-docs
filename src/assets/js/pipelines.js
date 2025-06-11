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
  
        paragraphsContainer.innerHTML = "";
  
        if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
          readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer);
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
  
    window.addEventListener("load", function () {
      toggleScrolled();
      loadYAML("../assets/content/pages/pipelines/pipelines.yaml");
    });
  })();
