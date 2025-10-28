"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Edit the TypeScript file, not the compiled JavaScript file.
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import { createHeaderNavDiv } from './header';
import { trueIfMissing } from './types/types';
import { readCodeblocks, urlExistsWithoutRedirect } from './utils';
import { loadYaml } from './yaml';
function titleCase(title) {
    return title.charAt(0).toUpperCase() + title.slice(1);
}
function formatPageTitle(title) {
    const segments = title.match(/(\d+|\D+)/g) || [];
    return segments.map(segment => titleCase(segment)).join(" ");
}
class UnderConstruction extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("role", "complementary");
        this.setAttribute("aria-label", "Page status notice");
        this.innerHTML = `<aside>This page is under construction. To suggest content-related edits, please open a <a href="https://github.com/FCP-INDI/cpac-docs/blob/main/CONTRIBUTING.md#writing-a-content-related-pr:~:text=Appendix-,Writing%20a%20Content%2DRelated%20PR,-To%20contribute%20content">content-related PR
      </a>.</aside>`;
    }
}
function normalizeGridArray(input) {
    if (Array.isArray(input)) {
        if (typeof input[0] === 'string') {
            return input.map(p => ({ page: p }));
        }
        if (typeof input[0] === 'object' && input[0] !== null && 'page' in input[0]) {
            return input;
        }
    }
    if (typeof input === 'string') {
        return [{ page: input }];
    }
    return [];
}
function loadData(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = yield loadYaml(filename.href);
        (_a = data.meta) !== null && _a !== void 0 ? _a : (data.meta = {});
        // set defaults
        trueIfMissing.forEach(attribute => {
            if (data === null || data === void 0 ? void 0 : data.meta) {
                if (data.meta[attribute] === undefined) {
                    data.meta[attribute] = true;
                }
            }
        });
        if (data === null || data === void 0 ? void 0 : data.grid) {
            data.grid = normalizeGridArray(data.grid);
        }
        return data;
    });
}
function constructUrl(dataId, ext = "yaml", supersection = null, subsection = null, inSection = true, assets = true) {
    let section = "assets";
    supersection !== null && supersection !== void 0 ? supersection : (supersection = "content/pages");
    section = assets ? [section, supersection].join("/") : supersection;
    if (inSection) {
        if (!subsection) {
            subsection !== null && subsection !== void 0 ? subsection : (subsection = getSection(window.location.href));
        }
        section = [section, subsection].join("/");
        if (section === "assets/content/pages/") {
            section = "";
            inSection = false;
        }
    }
    const baseUrl = window.location.origin;
    const pathname = window.location.pathname.split("/");
    if (section === "" || section === null && dataId == "cpac-docs/versions") {
        return new URL(ext ? `${baseUrl}/${dataId}.${ext}` : `${baseUrl}/${dataId}`, baseUrl);
    }
    let project_slug = "";
    let version = undefined;
    while (pathname.length && !project_slug) {
        const next = pathname.shift();
        if (next !== undefined) {
            project_slug = next;
        }
        if (project_slug === "cpac-docs") {
            while (pathname.length && !version) {
                const nextVersion = pathname.shift();
                version = nextVersion;
            }
        }
    }
    if (version === "versions" || version === "index.html") {
        version = "";
    }
    if (project_slug === "pages") {
        project_slug = "../..";
    }
    else if (project_slug === "versions") {
        project_slug = "cpac-docs";
    }
    else {
        project_slug = `/${project_slug}`;
    }
    const basePath = (version ? `${project_slug}/${version}/${section}/${dataId}` : `${project_slug}/${section}/${dataId}`).replace(/([^:]\/)\/+/g, "$1");
    return new URL(ext === "" ? `${basePath}` : `${basePath}.${ext}`, baseUrl);
}
function getData(container_1) {
    return __awaiter(this, arguments, void 0, function* (container, filename = null) {
        const dataId = container.getAttribute("data-id");
        let yamlData = {};
        let section = null;
        if (dataId && !filename) {
            section = getSection(window.location.href);
            filename = constructUrl(dataId);
        }
        if (typeof filename === "string") {
            filename = new URL(filename);
        }
        if (filename instanceof URL) {
            try {
                yamlData = yield loadData(filename);
            }
            catch (error) {
                console.error(`Error loading YAML from ${filename}:`, error);
                container = getOrCreateContainer("paragraphsContent", "div", container);
                if (container) {
                    let message = "";
                    if (error instanceof Error) {
                        message = error.message;
                    }
                    else {
                        message = `${error}`;
                    }
                    container.textContent = `Failed to load YAML from ${filename}: ${message}`;
                }
                ;
            }
        }
        else if (filename === null) {
            console.error("loadYAML: No filename provided. \"data-id\" not found in `<main>` element.");
        }
        else {
            console.error(`Invalid filename provided: "${filename}".`);
        }
        return [yamlData, section];
    });
}
function getSection(filename) {
    const pathParts = String(filename).split("/");
    const index = pathParts.indexOf("pages") + 1;
    return index ? pathParts[index] : "";
}
function readYAMLparagraphs(paragraphs, container, isTopLevel = false) {
    paragraphs.forEach(item => {
        const section = document.createElement("div");
        section.classList.add("paragraph-section");
        if (typeof item === "object") {
            if ("paragraph" in item && item.paragraph) {
                const heading = document.createElement(isTopLevel ? "h6" : "h6");
                heading.innerHTML = item.paragraph;
                section.appendChild(heading);
            }
            if ("details" in item && Array.isArray(item.details)) {
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
            if ("subparagraphs" in item && Array.isArray(item.subparagraphs) && item.subparagraphs.length > 0) {
                const subContainer = document.createElement("div");
                subContainer.classList.add("subparagraphs-container");
                readYAMLparagraphs(item.subparagraphs, subContainer, false);
                section.appendChild(subContainer);
            }
            if ("codeblocks" in item && Array.isArray(item.codeblocks)) {
                readCodeblocks(item, section);
            }
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
function checkForDom(parent, sibling) {
    // sibling takes precedence
    if (sibling instanceof HTMLElement) {
        return sibling;
    }
    if (parent instanceof HTMLElement) {
        return parent;
    }
    throw new Error("No tree information given.");
}
function getOrCreateContainer(id, type, parent = null, sibling = null, attributes = {}) {
    // If parent and sibling both given, sibling takes precedence.
    let container = document.getElementById(id);
    let return_container = container;
    if (!container) {
        container = document.createElement(type);
        container.setAttribute("id", id);
        for (const key in attributes) {
            container.setAttribute(key, attributes[key]);
        }
        return_container = container;
        if (container.getAttribute("class") == "grid") {
            // Wrap grid in centered container div
            const gridContainer = document.createElement("div");
            gridContainer.setAttribute("class", "container");
            gridContainer.appendChild(container);
            return_container = container;
            container = gridContainer;
        }
        if (sibling) {
            sibling.after(container);
        }
        else if (parent) {
            parent.appendChild(container);
        }
    }
    return return_container ? return_container : checkForDom(parent, sibling);
}
function createGridCard(cardData_1, index_1) {
    return __awaiter(this, arguments, void 0, function* (cardData, index, subsection = "pages", ext = "html") {
        var _a, _b;
        const gridCard = document.createElement("div");
        gridCard.setAttribute("class", "grid-item");
        const anchor = document.createElement("a");
        anchor.setAttribute("href", `${constructUrl(cardData.page, ext, subsection, null, true, false)}`);
        gridCard.appendChild(anchor);
        const img = document.createElement("img");
        let title = cardData.page;
        const dataUrl = constructUrl(cardData.page);
        if (yield urlExistsWithoutRedirect(dataUrl)) {
            const pageData = yield loadData(dataUrl);
            title = (_b = (_a = pageData === null || pageData === void 0 ? void 0 : pageData.meta) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : formatPageTitle(cardData.page);
        }
        anchor.setAttribute("data-label", title);
        img.setAttribute("alt", title);
        img.setAttribute("src", (cardData === null || cardData === void 0 ? void 0 : cardData.image) ? `${cardData.image}` : `${constructUrl(`b${(index % 9) + 1}`, "png", "img/tiles", null, false)}`);
        anchor.appendChild(img);
        return gridCard;
    });
}
function populateGrid(yamlData_1) {
    return __awaiter(this, arguments, void 0, function* (yamlData, parent = null, sibling = null) {
        var _a;
        if ("grid" in yamlData && yamlData.grid) {
            let subsection = "pages";
            let ext = "html";
            if (((_a = yamlData === null || yamlData === void 0 ? void 0 : yamlData.meta) === null || _a === void 0 ? void 0 : _a.title) === "C-PAC Documentation Versions") {
                subsection = "";
                ext = "";
            }
            const gridContainer = getOrCreateContainer("index-grid", "div", parent, sibling, { "class": "grid" });
            for (const [index, cardData] of yamlData.grid.entries()) {
                const card = yield createGridCard(cardData, index, subsection, ext);
                gridContainer.appendChild(card);
            }
        }
        return checkForDom(parent, sibling);
    });
}
function populateIframe(yamlData, parent = null, sibling = null) {
    const iframeContainer = getOrCreateContainer("iframeContent", "div", parent, sibling);
    if ("iframe" in yamlData && yamlData.iframe) {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("src", `${yamlData.iframe}`);
        iframe.setAttribute("class", "full-view");
        iframeContainer.appendChild(iframe);
        return iframeContainer;
    }
    return checkForDom(parent, sibling);
}
function populateParagraphs(yamlData, parent = null, sibling = null) {
    const paragraphsContainer = getOrCreateContainer("paragraphsContent", "div", parent, sibling);
    if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        paragraphsContainer.innerHTML = "";
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, true);
        return paragraphsContainer;
    }
    return checkForDom(parent, sibling);
}
function populateTitle(yamlData, section, parent = null, sibling = null) {
    var _a, _b, _c;
    if ("meta" in yamlData && yamlData.meta) {
        if (!((_a = yamlData === null || yamlData === void 0 ? void 0 : yamlData.meta) === null || _a === void 0 ? void 0 : _a.displayTitle))
            return checkForDom(parent, sibling);
        const title = (_b = yamlData.meta.title) !== null && _b !== void 0 ? _b : (() => {
            var _a;
            const basename = (_a = window.location.pathname.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
            return basename ? formatPageTitle(basename) : "";
        })();
        const titleContainer = getOrCreateContainer("title", "div", parent, sibling, { "class": "title" });
        if ((_c = yamlData === null || yamlData === void 0 ? void 0 : yamlData.meta) === null || _c === void 0 ? void 0 : _c.subtitle) {
            const subtitle = section ? `${section.charAt(section.length - 1) === "s" ? titleCase(section.slice(0, -1)) : titleCase(section)}: `
                : "";
            titleContainer.innerHTML = subtitle + title;
        }
        else {
            titleContainer.innerHTML = title;
        }
        return titleContainer;
    }
    return checkForDom(parent, sibling);
}
function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (h && !h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top"))
        return;
    if (b) {
        if (window.scrollY > 100) {
            b.classList.add("scrolled");
        }
        else {
            b.classList.remove("scrolled");
        }
        ;
    }
    ;
}
document.addEventListener("scroll", toggleScrolled);
window.addEventListener("load", toggleScrolled);
function asyncPopulate(container, data, latestElement, fxn) {
    return __awaiter(this, void 0, void 0, function* () {
        if (latestElement === container) {
            return yield fxn(data, latestElement);
        }
        return yield fxn(data, container, latestElement);
    });
}
function populate(container, data, latestElement, fxn) {
    if (latestElement === container) {
        return fxn(data, latestElement);
    }
    return fxn(data, container, latestElement);
}
function populatePage() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementsByTagName("main")[0]; // first (hopefully only <main> element)
        const [yamlData, section] = yield getData(container);
        let latestElement = container;
        populateHeader(section);
        latestElement = populateTitle(yamlData, section, latestElement);
        latestElement = yield asyncPopulate(container, yamlData, latestElement, populateGrid);
        populate(container, yamlData, latestElement, populateIframe);
        populate(container, yamlData, latestElement, populateParagraphs);
        yield populateFooter(yamlData, container);
    });
}
function populateHeader(section) {
    createHeaderNavDiv(section);
}
function populateFooter(yamlData, container) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        let footer = document.getElementsByTagName("footer")[0];
        if (!footer) {
            footer = document.createElement("footer");
            container.after(footer);
        }
        footer.setAttribute("class", "footer");
        footer.innerHTML = (_d = (_b = (_a = yamlData === null || yamlData === void 0 ? void 0 : yamlData.meta) === null || _a === void 0 ? void 0 : _a.copyright) !== null && _b !== void 0 ? _b : (_c = (yield loadData(constructUrl("about", "yaml", null, "about", true))).meta) === null || _c === void 0 ? void 0 : _c.copyright) !== null && _d !== void 0 ? _d : "";
    });
}
const customElementRegistry = window.customElements;
customElementRegistry.define("under-construction", UnderConstruction);
window.addEventListener("load", () => {
    toggleScrolled();
    populatePage();
    Prism.highlightAll();
});
