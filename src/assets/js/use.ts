// use.ts
import jsyaml from 'js-yaml';
import Prism from 'prismjs';
import 'prismjs/components/prism-yaml';

import type { ParagraphsList, YamlData } from './types/types';
import { readCodeblocks } from './utils';

(function (): void {
  "use strict";

  const headingIds = new Set<string>();

  function toggleScrolled(): void {
    const b = document.querySelector("body");
    const h = document.querySelector("#header") as HTMLElement;
    if (
      !h?.classList.contains("scroll-up-sticky") &&
      !h?.classList.contains("sticky-top") &&
      !h?.classList.contains("fixed-top")
    )
      return;
    b?.classList.toggle("scrolled", window.scrollY > 100);
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  async function loadYAML(filename: string): Promise<void> {
    if (!filename) {
      console.error("loadYAML: No filename provided.");
      return;
    }

    try {
      const response = await fetch(filename);
      const yamlText = await response.text();
      const yamlData = jsyaml.load(yamlText) as YamlData;

      const paragraphsContainer = document.getElementById("paragraphsContent");
      if (!paragraphsContainer) return;
      
      paragraphsContainer.innerHTML = "";

      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, 0);
      }
    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      if (container) {
        container.textContent = `Failed to load YAML from ${filename}: ${(error as Error).message}`;
      }
    }
  }

  function readYAMLparagraphs(
    paragraphs: ParagraphsList, 
    container: HTMLElement, 
    level: number = 0
  ): void {
    paragraphs.forEach((item) => {
      const section = document.createElement("div");
      section.classList.add("paragraph-section");

      if (typeof item === 'string') return;

      if ("paragraph" in item && item.paragraph) {
        let headingTag: keyof HTMLElementTagNameMap;
        if (level === 0) headingTag = "h3";
        else if (level === 1) headingTag = "h5";
        else headingTag = "h6";

        const heading = document.createElement(headingTag);
        heading.textContent = item.paragraph;
        let headingId = encodeURIComponent(
          heading.textContent.toLowerCase().replaceAll(" ", "-")
        );
        
        if (headingIds.has(headingId)) {
          let suffix = 1;
          let newHeadingId = `${headingId}-${suffix}`;
          while (headingIds.has(newHeadingId)) {
            suffix += 1;
            newHeadingId = `${headingId}-${suffix}`;
          }
          headingId = newHeadingId;
        }
        
        headingIds.add(headingId);
        heading.id = headingId;
        section.appendChild(heading);
      }

      if ("details" in item && Array.isArray(item.details)) {
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

      if ("codeblocks" in item && Array.isArray(item.codeblocks)) {
        readCodeblocks(item, section);
      }

      if ("subparagraphs" in item && Array.isArray(item.subparagraphs) && item.subparagraphs.length > 0) {
        const subContainer = document.createElement("div");
        subContainer.classList.add("subparagraphs-container");
        readYAMLparagraphs(item.subparagraphs, subContainer, level + 1);
        section.appendChild(subContainer);
      }

      container.appendChild(section);
    });

    // Add highlighting for inline code blocks
    if (Prism) {
      setTimeout(() => {
        (Prism).highlightAll();
      }, 0);
    }
  }

  function updateHeaderHeight(): void {
    const header = document.querySelector('header') as HTMLElement;
    if (!header) return;
    
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }

  window.addEventListener("load", () => {
    toggleScrolled();
    loadYAML("../assets/content/pages/use/use.yaml");
    updateHeaderHeight();
    Prism.highlightAll();
  });
  
  window.addEventListener('resize', updateHeaderHeight);
})();

