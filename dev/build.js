const { execSync } = require("child_process");
const outDir = process.env.OUTDIR || "./cpac-docs/develop";
console.log(`Building to ${outDir}`);
execSync(`vite build`, { stdio: "inherit", env: { ...process.env, OUTDIR: outDir } });
