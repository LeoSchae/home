// @ts-ignore
import Eleventy from "@11ty/eleventy/src/Eleventy";

(async function () {
  const environment =
    process.env.NODE_ENV === "development" ? "development" : "production";
  const isDevelopment = environment === "development";
  const isProduction = !isDevelopment;

  const eleventy = new Eleventy(undefined, undefined, {
    configPath: "./eleventy/.eleventy.ts",
  });
  //eleventy.setPathPrefix("/home/");
  switch (environment) {
    case "development":
      await eleventy.init();
      await eleventy.watch();
      eleventy.serve(8080);
      break;
    case "production":
      await eleventy.write();
      break;
    default:
      let assertUnreachable: never = environment;
      break;
  }
})();
