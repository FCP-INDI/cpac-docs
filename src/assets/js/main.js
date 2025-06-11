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
      const listContainer = document.getElementById("listContent");

      if (!paragraphsContainer || !mermaidContainer || !listContainer) {
        console.error("One or more required containers are missing in the DOM.");
        return;
      }

      paragraphsContainer.innerHTML = "";
      mermaidContainer.innerHTML = "";
      listContainer.innerHTML = "";

      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer);
      }

      if (yamlData.mermaid) {
        renderMermaidFromYAML(yamlData.mermaid, mermaidContainer);
      }

      if (yamlData.list && Array.isArray(yamlData.list)) {
        renderYAMLList(yamlData.list, listContainer);
      }

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      if (container) {
        container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
      }
    }
  }

  function readYAMLparagraphs(paragraphs, container, isTopLevel = false) {
    paragraphs.forEach(item => {
      const section = document.createElement("div");
      section.classList.add("paragraph-section");

      if (item.paragraph) {
        const heading = document.createElement(isTopLevel ? "h6" : "h6");
        heading.textContent = item.paragraph;

        section.appendChild(heading);
      }

      if (Array.isArray(item.details)) {
        const ul = document.createElement("ul");
        ul.classList.add("paragraph-details-list");

        item.details.forEach(detailText => {
          const li = document.createElement("li");
          li.textContent = detailText || "(detail)";
          li.classList.add("paragraph-detail");
          ul.appendChild(li);
        });

        section.appendChild(ul);
      }

      if (Array.isArray(item.subparagraphs) && item.subparagraphs.length > 0) {
        const subContainer = document.createElement("div");
        subContainer.classList.add("subparagraphs-container");
        readYAMLparagraphs(item.subparagraphs, subContainer, false);
        section.appendChild(subContainer);
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
      const title = document.createElement("h6");
      title.textContent = mermaidData.title;
      container.appendChild(title);
    }

    const mermaidDiagram = document.createElement("div");
    mermaidDiagram.classList.add("mermaid");
    mermaidDiagram.textContent = mermaidData.operations;

    container.appendChild(mermaidDiagram);

    mermaid.init(undefined, mermaidDiagram);
  }

  function renderYAMLList(listData, container) {
    listData.forEach((item) => {
      const section = document.createElement("div");
      section.classList.add("list-section");
  
      const title = document.createElement("h6");
      title.textContent = item.title;
      title.style.fontWeight = "bold";
      section.appendChild(title);
  
      const bulletList = document.createElement("ul");
  
      if (Array.isArray(item.bullets)) {
        item.bullets.forEach((bulletObj) => {
          const bulletItem = document.createElement("li");
          bulletItem.textContent = bulletObj.bullet;
  
          // Check for sub-bullets
          if (Array.isArray(bulletObj["sub-bullets"])) {
            const subBulletList = document.createElement("ul");
  
            bulletObj["sub-bullets"].forEach((subBulletObj) => {
              const subBulletItem = document.createElement("li");
              subBulletItem.textContent = subBulletObj["sub-bullet"];
  
              // Check for level-three-bullets
              if (Array.isArray(subBulletObj["level-three-bullets"])) {
                const levelThreeList = document.createElement("ul");
  
                subBulletObj["level-three-bullets"].forEach((lvl3) => {
                  const lvl3Item = document.createElement("li");
                  lvl3Item.textContent = lvl3;
                  levelThreeList.appendChild(lvl3Item);
                });
  
                subBulletItem.appendChild(levelThreeList);
              }
  
              subBulletList.appendChild(subBulletItem);
            });
  
            bulletItem.appendChild(subBulletList);
          }
  
          bulletList.appendChild(bulletItem);
        });
      }
  
      section.appendChild(bulletList);
      container.appendChild(section);
    });
  }
  
  

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: false });
  });

  window.addEventListener("load", function () {
    toggleScrolled();
    loadYAML("assets/content/pages/index/index.yaml");
  });
})();
