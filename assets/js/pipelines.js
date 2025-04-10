(function () {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (!h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);

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
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, true);
      }

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
    }
  }

  function readYAMLparagraphs(paragraphs, container, isTopLevel = false) {
    paragraphs.forEach(item => {
      const section = document.createElement("div");
      section.classList.add("paragraph-section");

      if (item.paragraph) {
        const heading = document.createElement(isTopLevel ? "h4" : "h5");
        heading.textContent = item.paragraph;

        if (isTopLevel) {
          heading.style.fontWeight = "bold"; 
        } else {
          heading.style.fontWeight = "normal"; 
          heading.style.fontStyle = "italic";  
        }

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

  // Add event listeners for the dropdown menu
  function setupDropdownMenu() {
    const dropdown = document.querySelector(".navmenu li.dropdown");
    const dropdownMenu = dropdown.querySelector(".dropdown-menu");

    // Show dropdown on mouse enter
    dropdown.addEventListener("mouseenter", function() {
      dropdownMenu.style.display = "block";
    });

    // Hide dropdown on mouse leave
    dropdown.addEventListener("mouseleave", function() {
      dropdownMenu.style.display = "none";
    });
  }

  window.addEventListener("load", () => {
    toggleScrolled();
    setupDropdownMenu(); // Initialize the dropdown menu
  });
})();
