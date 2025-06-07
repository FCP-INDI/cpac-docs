#!/usr/bin/env node
// Update Node.js requirements in CONTRIBUTING.md based on package.json
"use strict";
const fs = require("fs");
const path = require("path");

const PACKAGE_JSON = path.join(process.cwd(), "package.json");
const CONTRIBUTING_MD = path.join(process.cwd(), "CONTRIBUTING.md");

const START_TAG = `## Local development

Some of the automation for GitHub Pages and autoversioned documentation requires this repository be called "cpac-docs".

### Requirements
`;
const END_TAG = "- [pre-commit](https://pre-commit.com)";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractEngines() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
  const engines = pkg.engines || {};
  return engines;
}

const canonicalUrls = {
  node: "https://nodejs.org/en/download/releases/",
  yarn: "https://yarnpkg.com/getting-started/releases",
  // add more tools if needed
};

function formatEngineLine(tool, version) {
  const url = canonicalUrls[tool.toLowerCase()] || null;
  if (url) {
    return `- [${tool}](${url}) \`${version}\``;
  }
  return `- ${tool} \`${version}\``;
}

function updateContributing(engines) {
  if (!fs.existsSync(CONTRIBUTING_MD)) {
    console.error("No CONTRIBUTING.md file found.");
    process.exit(1);
  }

  const content = fs.readFileSync(CONTRIBUTING_MD, "utf8");

  const pattern = new RegExp(
    `(${escapeRegExp(START_TAG)})([\\s\\S]*?)(${escapeRegExp(END_TAG)})`,
    "m"
  );


  if (!pattern.test(content)) {
    console.error("Required lines not found in CONTRIBUTING.md.");
    process.exit(1);
  }

  const requirementsList = Object.entries(engines)
    .map(([tool, version]) => formatEngineLine(tool, version))
    .join("\n");

  const replacement = `${START_TAG}
${requirementsList || ""}
${END_TAG}`;

  const updated = content.replace(pattern, replacement);

  fs.writeFileSync(CONTRIBUTING_MD, updated);
  console.log("Updated engine requirements in CONTRIBUTING.md.");
}

const engines = extractEngines();
updateContributing(engines);
