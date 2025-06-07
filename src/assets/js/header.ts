"use strict";
 
// Edit the TypeScript file, not the compiled JavaScript file.

export function createHeaderNavDiv(selected: string | null = null): void {
  const header = document.getElementById("header");
  
  if (header) {
    const container = document.createElement("div");
    container.className = "container-fluid position-relative d-flex align-items-center justify-content-between";
    const lead: string = (header?.getAttribute("data-navbar") === "false") ? "cpac-docs/" : "../";
    // Logo link
    const logoLink = document.createElement("a");
    logoLink.href = `${lead}../index.html`;
    logoLink.className = "logo d-flex align-items-center me-auto me-xl-0";
    const logoImg = document.createElement("img");
    logoImg.src = `${lead}../assets/img/logo.png`;
    logoImg.alt = "";
    logoLink.appendChild(logoImg);
    container.appendChild(logoLink);
    if (header?.getAttribute("data-navbar") !== "false") {
      // Navigation menu

      const nav = document.createElement("nav");
      nav.id = "navmenu";
      nav.className = "navmenu";
      const ul = document.createElement("ul");

      const links = [
        { href: `${lead}../index.html`, text: "C-PAC", id: "index" },
        { href: `${lead}about.html`, text: "About", id: "about" },
        { href: `${lead}neuroimaging.html`, text: "Neuroimaging", id: "neuroimaging" },
        { href: `${lead}pipelines.html`, text: "Pipelines", id: "pipelines" },
        { href: `${lead}use.html`, text: "How to Use", id: "use" },
        { href: `${lead}tutorials`, text: "Tutorials", id: "tutorials" },
        { href: `${lead}projects.html`, text: "Projects", id: "projects" },
        { href: `${lead}support.html`, text: "User Support", id: "support" },
        { href: `${lead}appendix.html`, text: "Appendix", id: "appendix" }
      ];

      links.forEach(link => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        a.setAttribute("data-id", link.id);
        if (selected && link.id === selected) {
          a.classList.add("active");
        }
        li.appendChild(a);
        ul.appendChild(li);
      });

      nav.appendChild(ul);
      container.appendChild(nav);
    }
  
    header.insertBefore(container, header.firstChild);
  }
}
