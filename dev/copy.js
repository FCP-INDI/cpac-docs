const { execSync } = require("child_process");

const outDir = process.env.OUTDIR || "./cpac-docs/develop";
console.log(`Copying files to ${outDir}`);
execSync(`cpx "src/**/*.!(ts)" "${outDir}"`, { stdio: "inherit" });
execSync(`cpx "versions.yaml" "./cpac-docs"`, { stdio: "inherit" });
execSync(`cpx "index.html" "./cpac-docs"`, { stdio: "inherit" });
