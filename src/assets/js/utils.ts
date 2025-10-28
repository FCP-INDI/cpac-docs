import type { CodeBlocksData } from './types/types';

export async function urlExistsWithoutRedirect(url: URL): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store'
    });

    // Check if it's a redirect
    if ([301, 302, 303, 304, 307, 308].includes(response.status)) {
      console.log('Redirect detected to:', response.headers.get('Location'));
      return false;
    }

    return response.ok; // true if status is 2xx
  } catch (error) {
    console.error('Error checking URL:', error);
    return false;
  }
}

// Helper to replace tree chars with spaces
function sanitizeTreeChars(text: string): string {
  // Replace │ and ├── and └── with spaces to indent properly in YAML
  return text
    .replace(/│/g, "    ")   // vertical bar -> 4 spaces
    .replace(/├──/g, "    ") // branch -> 4 spaces
    .replace(/└──/g, "    "); // end branch -> 4 spaces
}

export function readCodeblocks(item: CodeBlocksData, section: HTMLDivElement): void {
  const codeContainer = document.createElement("div");
  codeContainer.classList.add("paragraph-codeblock");
  item.codeblocks.forEach((block) => {
    const pre = document.createElement("pre");
    const codeElem = document.createElement("code");
    
    // Support both old (string) and new (object) syntax
    const code = typeof block === "string" ? block : block.code;
    const language = typeof block === "string" ? "yaml" : (block.language || "yaml");
    
    codeElem.className = `language-${language}`;
    codeElem.textContent = sanitizeTreeChars(code);
    pre.appendChild(codeElem);
    codeContainer.appendChild(pre);
  });
  
  section.appendChild(codeContainer);
}
