import * as types from "../types";
import fs from "fs";
import path from "path";
import winston from "winston";

let nunjucks = require("nunjucks");

function getCtx(
  ctx: types.JsCTX | types.HandlebarsCTX | types.LiquidCTX | types.NunjucksCTX
): types.JsCTX {
  let c: any = ctx;
  if (c.context) return c.context.environments;
  if (c.ctx) return c.ctx;
  return c || {};
}

type Options = {
  links?: {
    prefix?: string;
  };
};

export default function (config: types.EleventyConfig, options: Options) {
  loggingPlugin(config, options);
  linkChecks(config, options);
}

function cleanBuildFolder(config: types.EleventyConfig, options: Options) {
  config.on(
    "eleventy.before",
    (options) =>
      new Promise((resolve, reject) => {
        console.log("Removing build dir");
        fs.rm(options.dir.output, { recursive: true, force: true }, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      })
  );
}

/**
 * Adds a link shortcode and javascript function that adds a prefix
 * when using absolute paths.
 * Additionally emits a warning when linking to
 * nonexistent sites.
 * @param config
 * @param options
 */
function linkChecks(config: types.EleventyConfig, options: Options) {
  // [unprefixed links]: [unprefixed url of calling page][]
  let toCheck: { [key: string]: string[] | undefined } = {};

  config.on("eleventy.before", () => {
    toCheck = {};
  });
  config.on("eleventy.after", (res) => {
    for (let page of res.results as any) {
      delete toCheck[page.url];
    }
    for (let link of Object.keys(toCheck)) {
      for (let site of toCheck[link] as string[]) {
        config.javascriptFunctions.warn.call({ page: { url: site } }, link);
      }
    }
  });

  let prefix = options.links?.prefix || "";
  if (prefix && prefix.endsWith("/"))
    prefix = prefix.substring(0, prefix.length - 1);

  config.addFilter("link", function (this: types.AnyCTX, link: string) {
    let source = getCtx(this).page?.url || "[unknown]";
    if (toCheck[link]) toCheck[link]?.push(source);
    else toCheck[link] = [source];

    // Prefix only absolute links
    if (link.startsWith("/")) return prefix + link;
    else return link;
  });
}

/**
 * Redefines the 'log' filter and adds additional filters
 * 'info', 'warn' and 'verbose'.
 * @param config
 * @param options
 */
function loggingPlugin(config: types.EleventyConfig, options: Options) {
  const levelList = ["info", "warn", "verbose"];
  const levelMap: { [key: string | number]: string | number } = {};
  for (var i = 0; i < levelList.length; i++) {
    levelMap[i] = levelList[i];
    levelMap[levelList[i]] = i;
  }

  let currentLog: { level: number; message: string; source: string }[] = [];

  config.on("eleventy.before", function () {
    currentLog = [];
  });
  config.on("eleventy.after", async function (this: any) {
    await new Promise<void>((res) => {
      setTimeout(() => res(), 1000);
    });

    fs.writeFile(
      path.join("./_build/buildlog.json"),
      JSON.stringify({ levels: levelList, messages: currentLog }),
      (err) => {
        if (err) console.log(err);
      }
    );
    let res = nunjucks.render(path.join(__dirname, "logging.njk"), {
      logURL: "buildlog.json",
    });
    fs.writeFile(path.join("./_build/buildlog.html"), res, (err) => {
      if (err) console.log(err);
    });
  });

  (config as any).setQuietMode(true);

  let logger = winston.createLogger({
    level: "verbose",
    transports: [
      /*new winston.transports.File({
        filename: "./_build.log",
        format: winston.format.json(),
        options: { flags: "w" },
      }),*/
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });

  function log(
    message: any,
    source: string | undefined,
    level: string = "info"
  ) {
    source = source || "[unknown]";
    let log = {
      level: levelMap[level] as number,
      message,
      source,
    };
    logger.log({
      level,
      message,
      source,
    });
    currentLog.push(log);
  }

  delete config.javascriptFunctions.log;
  delete config.nunjucksFilters.log;
  delete config.liquidFilters.log;
  delete config.handlebarsHelpers.log;
  config.addFilter("log", function (this: types.AnyCTX, message: any) {
    log(message, getCtx(this).page?.url, "info");
  });

  for (let level of levelList)
    config.addFilter(level, function (this: types.AnyCTX, message: any) {
      log(message, getCtx(this).page?.url, level);
    });
}
