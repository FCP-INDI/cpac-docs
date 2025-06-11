const { execSync } = require("child_process");

const outDir = process.env.OUTDIR || "./cpac-docs/develop";
console.log(`Copying global assets to ${outDir}/assets`);
execSync(`cpx "${outDir}/assets/**/*" ./cpac-docs/assets`, {
  stdio: "inherit",
});
