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

type Options = {};

export default function (config: types.EleventyConfig, options: Options) {
  loggingPlugin(config, options);
}

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
  config.on("eleventy.after", function (this: any) {
    console.log(Object.keys(arguments[0]), "\n", arguments[0].dir);
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
