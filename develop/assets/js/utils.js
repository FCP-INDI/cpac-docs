var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function urlExistsWithoutRedirect(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(url, {
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
        }
        catch (error) {
            console.error('Error checking URL:', error);
            return false;
        }
    });
}
// Helper to replace tree chars with spaces
function sanitizeTreeChars(text) {
    // Replace │ and ├── and └── with spaces to indent properly in YAML
    return text
        .replace(/│/g, "    ") // vertical bar -> 4 spaces
        .replace(/├──/g, "    ") // branch -> 4 spaces
        .replace(/└──/g, "    "); // end branch -> 4 spaces
}
export function readCodeblocks(item, section) {
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
