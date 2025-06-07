"use strict";
// Edit the TypeScript file, not the compiled JavaScript file.

import { createHeaderNavDiv } from './header.js';
import { AsyncElementCallback, ElementCallback, GridData, ParagraphsList, trueIfMissing, YamlData } from './types/types.js';
import { urlExistsWithoutRedirect } from './utils.js';
import { loadYaml } from './yaml.js';


function titleCase(title: string): string {
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function formatPageTitle(title: string): string {
  const segments = title.match(/(\d+|\D+)/g) || [];
  return segments.map(segment => titleCase(segment)).join(" ")
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

function normalizeGridArray(input: GridData[] | (string | URL)[] | string): GridData[] {
  if (Array.isArray(input)) {
    if (typeof input[0] === 'string') {
      return input.map(p => ({ page: p as string }));
    }
    if (typeof input[0] === 'object' && input[0] !== null && 'page' in input[0]) {
      return input as GridData[];
    }
  }
  if (typeof input === 'string') {
    return [{ page: input }];
  }
  return [];
}


async function loadData(filename: URL): Promise<YamlData> {
  const data = await loadYaml(filename.href) as YamlData;
  data.meta ??= {};
  // set defaults
  trueIfMissing.forEach(attribute => {
    if (data?.meta) {
      if (data.meta[attribute] === undefined) {
        data.meta[attribute] = true;
      }
    }
  });
  if (data?.grid) {
    data.grid = normalizeGridArray(data.grid);
  }
  return data;
}

function constructUrl(dataId: string, ext: string = "yaml", supersection: string | null = null, subsection: string | null = null, inSection: boolean = true, assets: boolean = true): URL {
  let section: string = "assets"
  supersection ??= "content/pages";
  section = assets ? [section, supersection].join("/") : supersection;
  if (inSection) {
      if (!subsection) {
          subsection ??= getSection(window.location.href);
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
  let version: string | undefined = undefined;
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
  console.log(project_slug, pathname);
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
  return new URL(ext === ""? `${basePath}` : `${basePath}.${ext}`, baseUrl);
}

async function getData(container: HTMLElement, filename: URL | string | null = null): Promise<[YamlData, string | null]> {
  const dataId: string | null = container.getAttribute("data-id");
  let yamlData: YamlData = {};
  let section: string | null = null;
  if (dataId && !filename) {
    section = getSection(window.location.href);
    filename = constructUrl(dataId);
  }
  if (typeof filename === "string") {
    filename = new URL(filename);
  }
  if (filename instanceof URL) {
    
    try {
      yamlData = await loadData(filename);
    } catch (error: unknown) {
      console.error(`Error loading YAML from ${filename}:`, error);
      container = getOrCreateContainer("paragraphsContent", "div", container);
      if (container) {
        let message: string = "";
        if (error instanceof Error) {
          message = error.message;
        } else {
          message = `${error}`;
        }
        container.textContent = `Failed to load YAML from ${filename}: ${message}`;
      };
    }
  } else if (filename === null) {
    console.error("loadYAML: No filename provided. \"data-id\" not found in `<main>` element.");
  } else {
    console.error(`Invalid filename provided: "${filename}".`)
  }
  return [yamlData, section];
}

function getSection(filename: URL | string): string {
  const pathParts: string[] = String(filename).split("/");
  const index: number = pathParts.indexOf("pages") + 1
  return index ? pathParts[index] : "";
}

function readYAMLparagraphs(paragraphs: ParagraphsList, container: HTMLElement, isTopLevel: boolean = false) {
  paragraphs.forEach(item => {
    const section = document.createElement("div");
    section.classList.add("paragraph-section");
    if (typeof item === "object") {
      if ("paragraph" in item && item.paragraph) {
        const heading = document.createElement(isTopLevel ? "h6" : "h6");
        heading.textContent = item.paragraph;

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
    }
    container.appendChild(section);
  });
}

function checkForDom(parent: HTMLElement | null, sibling: HTMLElement | null): HTMLElement {
  // sibling takes precedence
  if (sibling instanceof HTMLElement) {
    return sibling;
  }
  if (parent instanceof HTMLElement) {
    return parent;
  }
  throw new Error("No tree information given.");
}

function getOrCreateContainer(id: string, type: string, parent: HTMLElement | null = null, sibling: HTMLElement | null = null, attributes: Record<string, string> = {}): HTMLElement {
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
    } else if(parent) {
      parent.appendChild(container);
    }
  }
  return return_container ? return_container : checkForDom(parent, sibling);
}

async function createGridCard(cardData: GridData, index: number, subsection: string = "pages", ext: string = "html"): Promise<HTMLElement> {
const gridCard = document.createElement("div");

gridCard.setAttribute("class", "grid-item");

const anchor = document.createElement("a");
anchor.setAttribute("href", `${constructUrl(cardData.page, ext, subsection, null, true, false)}`);
gridCard.appendChild(anchor);
const img = document.createElement("img");
let title = cardData.page;
const dataUrl = constructUrl(cardData.page)

if (await urlExistsWithoutRedirect(dataUrl)) {
  const pageData = await loadData(dataUrl);
  title = pageData?.meta?.title ?? formatPageTitle(cardData.page);
}

anchor.setAttribute("data-label", title);
img.setAttribute("alt", title);
img.setAttribute("src", cardData?.image ? `${cardData.image}` : `${constructUrl(`b${(index % 9) + 1}`, "png", "img/tiles", null, false,)}`);
anchor.appendChild(img);

return gridCard;

}

async function populateGrid(yamlData: YamlData, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): Promise<HTMLElement> {
  if ("grid" in yamlData && yamlData.grid) {
    
    let subsection = "pages";
    let ext = "html";
    if (yamlData?.meta?.title === "C-PAC Documentation Versions") {
      subsection = "";
      ext = "";
    }
    const gridContainer: HTMLElement = getOrCreateContainer("index-grid", "div", parent, sibling, {"class": "grid"});
    
    for (const [index, cardData] of yamlData.grid.entries()) {
      const card = await createGridCard(cardData as GridData, index, subsection, ext);
      
      gridContainer.appendChild(card);
    }
  }
  return checkForDom(parent, sibling);
}

function populateIframe(yamlData: YamlData, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): HTMLElement {
  const iframeContainer: HTMLElement = getOrCreateContainer("iframeContent", "div", parent, sibling);
  if ("iframe" in yamlData && yamlData.iframe) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", `${yamlData.iframe}`);
    iframe.setAttribute("class", "full-view");
    iframeContainer.appendChild(iframe);
    return iframeContainer;
  }
  return checkForDom(parent, sibling);
}

function populateParagraphs(yamlData: YamlData, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): HTMLElement {
  const paragraphsContainer: HTMLElement = getOrCreateContainer("paragraphsContent", "div", parent, sibling);
  if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
    paragraphsContainer.innerHTML = "";
    readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, true);
    return paragraphsContainer;
  }
  return checkForDom(parent, sibling);
}

function populateTitle(yamlData: YamlData, section: string | null, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): HTMLElement {
  if ("meta" in yamlData && yamlData.meta) {
    if (!yamlData?.meta?.displayTitle) return checkForDom(parent, sibling);
    const title = yamlData.meta.title ?? (() => {
      const basename = window.location.pathname.split("/").pop()?.split(".")[0];
      return basename ? formatPageTitle(basename) : "";
    })();
    const titleContainer = getOrCreateContainer("title", "div", parent, sibling, {"class": "title"});
    if (yamlData?.meta?.subtitle) {
      const subtitle = section ? `${section.charAt(section.length - 1) === "s" ? titleCase(section.slice(0, -1)) : titleCase(section)}: `
    : "";
      titleContainer.innerHTML = subtitle + title;
    } else { titleContainer.innerHTML = title; }
    return titleContainer;
  }
  return checkForDom(parent, sibling);
}


function toggleScrolled(): void {
  const b: HTMLBodyElement | null = document.querySelector("body");
  const h: Element | null = document.querySelector("#header");
  if (h && !h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
  if (b) { 
    if (window.scrollY > 100) {
      b.classList.add("scrolled");
    } else {
      b.classList.remove("scrolled");
    };
  };
}

document.addEventListener("scroll", toggleScrolled);
window.addEventListener("load", toggleScrolled);

async function asyncPopulate(container: HTMLElement, data: YamlData, latestElement: HTMLElement, fxn: AsyncElementCallback): Promise<HTMLElement> {
  if (latestElement === container) {
    return await fxn(data, latestElement);
  }
  return await fxn(data, container, latestElement);
}

function populate(container: HTMLElement, data: YamlData, latestElement: HTMLElement, fxn: ElementCallback): HTMLElement {
  if (latestElement === container) {
    return fxn(data, latestElement);
  }
  return fxn(data, container, latestElement);
}

async function populatePage(): Promise<void> {
  const container = document.getElementsByTagName("main")[0];  // first (hopefully only <main> element)
  const [yamlData, section] = await getData(container);
  
  let latestElement: HTMLElement = container;
  populateHeader(section);
  latestElement = populateTitle(yamlData, section, latestElement);
  latestElement = await asyncPopulate(container, yamlData, latestElement, populateGrid);
  populate(container, yamlData, latestElement, populateIframe);
  populate(container, yamlData, latestElement, populateParagraphs);
  await populateFooter(yamlData, container);
}

function populateHeader(section: string | null) {
  createHeaderNavDiv(section);
}

async function populateFooter(yamlData: YamlData, container: HTMLElement): Promise<void> {
  let footer = document.getElementsByTagName("footer")[0];
  if (!footer) {
    footer = document.createElement("footer");
    container.after(footer);
  }
  footer.setAttribute("class", "footer");
  footer.innerHTML = yamlData?.meta?.copyright
  ?? (await loadData(constructUrl("about", "yaml", null, "about", true))).meta?.copyright
  ?? "";
}

const customElementRegistry = window.customElements;
customElementRegistry.define("under-construction", UnderConstruction);

window.addEventListener("load", () => {
  toggleScrolled();
  populatePage();
});