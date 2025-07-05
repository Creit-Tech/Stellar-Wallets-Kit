import { build, emptyDir } from "@deno/dnt";

await emptyDir("./dist");

await build({
  esModule: true,
  scriptModule: false,
  packageManager: "pnpm",
  entryPoints: [
    "./src/mod.ts",
    "./src/modules/albedo.module.ts",
    "./src/modules/freighter.module.ts",
    "./src/modules/hana.module.ts",
    "./src/modules/hotwallet.module.ts",
    "./src/modules/lobstr.module.ts",
    "./src/modules/rabet.module.ts",
    "./src/modules/xbull.module.ts",
  ],
  outDir: "./dist",
  shims: {
    // see JS docs for overview and more options
    deno: false,
  },
  typeCheck: false,
  package: {
    name: "@creit-tech/stellar-wallets-kit",
    version: "2.0.0",
    // description: "Your package.",
    // license: "MIT",
    // repository: {
    //   type: "git",
    //   url: "git+https://github.com/username/repo.git",
    // },
    // bugs: {
    //   url: "https://github.com/username/repo/issues",
    // },
  },
  // postBuild(): void {
  //   Deno.mkdirSync('./dist/view')
  //   Deno.copyFileSync('./src/view/main.js', './dist/view/main.js');
  //   Deno.copyFileSync('./src/view/styles.css', './dist/view/styles.css');
  // },
});
