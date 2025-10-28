var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// use.ts
import jsyaml from 'js-yaml';
import Prism from 'prismjs';
import 'prismjs/components/prism-yaml';
import { readCodeblocks } from './utils';
(function () {
    "use strict";
    const headingIds = new Set();
    function toggleScrolled() {
        const b = document.querySelector("body");
        const h = document.querySelector("#header");
        if (!(h === null || h === void 0 ? void 0 : h.classList.contains("scroll-up-sticky")) &&
            !(h === null || h === void 0 ? void 0 : h.classList.contains("sticky-top")) &&
            !(h === null || h === void 0 ? void 0 : h.classList.contains("fixed-top")))
            return;
        b === null || b === void 0 ? void 0 : b.classList.toggle("scrolled", window.scrollY > 100);
    }
    document.addEventListener("scroll", toggleScrolled);
    window.addEventListener("load", toggleScrolled);
    function loadYAML(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filename) {
                console.error("loadYAML: No filename provided.");
                return;
            }
            try {
                const response = yield fetch(filename);
                const yamlText = yield response.text();
                const yamlData = jsyaml.load(yamlText);
                const paragraphsContainer = document.getElementById("paragraphsContent");
                if (!paragraphsContainer)
                    return;
                paragraphsContainer.innerHTML = "";
                if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
                    readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, 0);
                }
            }
            catch (error) {
                console.error(`Error loading YAML from ${filename}:`, error);
                const container = document.getElementById("paragraphsContent");
                if (container) {
                    container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
                }
            }
        });
    }
    function readYAMLparagraphs(paragraphs, container, level = 0) {
        paragraphs.forEach((item) => {
            const section = document.createElement("div");
            section.classList.add("paragraph-section");
            if (typeof item === 'string')
                return;
            if ("paragraph" in item && item.paragraph) {
                let headingTag;
                if (level === 0)
                    headingTag = "h3";
                else if (level === 1)
                    headingTag = "h5";
                else
                    headingTag = "h6";
                const heading = document.createElement(headingTag);
                heading.textContent = item.paragraph;
                let headingId = encodeURIComponent(heading.textContent.toLowerCase().replaceAll(" ", "-"));
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
    function updateHeaderHeight() {
        const header = document.querySelector('header');
        if (!header)
            return;
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
    window.addEventListener("load", () => {
        toggleScrolled();
        loadYAML("../assets/content/pages/use/use.yaml").then(() => {
            // Scroll to hash after YAML is loaded
            if (window.location.hash) {
                setTimeout(() => {
                    const element = document.getElementById(window.location.hash.substring(1));
                    if (element)
                        element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
        updateHeaderHeight();
        Prism.highlightAll();
    });
    window.addEventListener('resize', updateHeaderHeight);
})();
