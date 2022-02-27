import fs from "fs";
import path from "path";
import winston from "winston";

let nunjucks = require("nunjucks");

export function EleventyPlugin(eleventyConfig: any, options: {}) {
  const defaultLevel = "info";
  const levelList = ["verbose", "info", "warn"];
  const levelMap: { [key: string | number]: string | number } = {};
  for (var i = 0; i < levelList.length; i++) {
    levelMap[i] = levelList[i];
    levelMap[levelList[i]] = i;
  }

  let currentLog: { level: number; message: string; source: string }[] = [];

  eleventyConfig.on("eleventy.before", () => {
    currentLog = [];
  });
  eleventyConfig.on("eleventy.after", () => {
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

  eleventyConfig.setQuietMode(true);

  let logger = winston.createLogger({
    level: "verbose",
    transports: [
      new winston.transports.File({
        filename: "./_build.log",
        format: winston.format.json(),
        options: { flags: "w" },
      }),
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });

  function templateLog(
    level: "info" | "verbose" | "warn",
    message: string,
    page: { url: string }
  ) {
    let log = {
      level: levelMap[level] as number,
      message,
      source: page.url,
    };
    logger.log({
      level,
      message,
      source: page.url,
    });
    currentLog.push(log);
  }

  delete eleventyConfig.javascriptFunctions.log;
  delete eleventyConfig.nunjucksFilters.log;
  delete eleventyConfig.liquidFilters.log;
  delete eleventyConfig.handlebarsHelpers.log;
  eleventyConfig.addFilter("verbose", function (this: EleventyThis) {
    templateLog(
      "verbose",
      [...arguments].map((o) => JSON.stringify(o)).join(),
      this.ctx.page
    );
  });
  eleventyConfig.addFilter("warn", function (this: any, data: any) {
    templateLog(
      "warn",
      [...arguments].map((o) => JSON.stringify(o)).join(),
      this.ctx.page
    );
  });
  eleventyConfig.addFilter("info", function (this: any, data: any) {
    templateLog(
      "info",
      [...arguments].map((o) => JSON.stringify(o)).join(),
      this.ctx.page
    );
  });
  eleventyConfig.addFilter("log", function (this: EleventyThis) {
    templateLog(
      "info",
      [...arguments].map((o) => JSON.stringify(o)).join(),
      this.ctx.page
    );
  });
}
