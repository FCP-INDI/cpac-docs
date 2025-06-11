// Import the type for js-yaml
import type * as jsyamlType from 'js-yaml';

// Helper to dynamically load the CDN js-yaml script and return its global object
function loadJsYamlCdn(): Promise<typeof jsyamlType> {
  return new Promise((resolve, reject) => {
    const globalWindow = window as typeof window & { jsyaml?: typeof jsyamlType };

    if (globalWindow.jsyaml) {
      resolve(globalWindow.jsyaml);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
    script.onload = () => {
      if (globalWindow.jsyaml) {
        resolve(globalWindow.jsyaml);
      } else {
        reject(new Error('Failed to load js-yaml from CDN'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load js-yaml script'));
    document.head.appendChild(script);
  });
}

// Recursive include resolver
async function resolveIncludes(yamlText: string, baseUrl: string): Promise<string> {
  const lines = yamlText.split('\n');
  const resolvedLines = await Promise.all(lines.map(async (line) => {
    const match = line.match(/^(\s*[^:]+:\s*)!include\s+(.*)$/);
    if (match) {
      const indent = match[1];
      const includePath = match[2].trim();
      const includeUrl = new URL(includePath, baseUrl).href;

      const includedResponse = await fetch(includeUrl);
      if (!includedResponse.ok) {
        throw new Error(`Failed to fetch included file: ${includeUrl}`);
      }

      const includedText = await includedResponse.text();
      const ext = includePath.split('.').pop()?.toLowerCase();

      if (ext === 'json') {
        const json = JSON.parse(includedText);
        return indent + JSON.stringify(json, null, 2).replace(/\n/g, '\n' + ' '.repeat(indent.length));
      } else if (ext === 'yaml' || ext === 'yml') {
        const resolved = await resolveIncludes(includedText, includeUrl);
        return resolved
          .split('\n')
          .map(subLine => indent + subLine)
          .join('\n');
      } else {
        return indent + JSON.stringify(includedText); // treat as raw string
      }
    }
    return line;
  }));

  return resolvedLines.join('\n');
}

// Define YAML-parsed type: a JSON-serializable value
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

// Recursive async YAML loader with support for !include
export async function loadYaml(url: string): Promise<JSONValue> {
  const jsyaml = await loadJsYamlCdn();
  const { DEFAULT_SCHEMA, load: jsLoadYamlSync } = jsyaml;

  async function fetchAndParse(currentUrl: string): Promise<JSONValue> {
    const response = await fetch(currentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${currentUrl}`);
    }
    const text = await response.text();

    const resolvedText = await resolveIncludes(text, currentUrl);
    const parsed = jsLoadYamlSync(resolvedText, { schema: DEFAULT_SCHEMA }) as JSONValue;
    return parsed;
  }

  return await fetchAndParse(url);
}
