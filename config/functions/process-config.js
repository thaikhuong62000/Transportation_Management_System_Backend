"use strict";

const fs = require("fs");
const config_path = "./.config.json";

module.exports = (strapi) => {
  if (!strapi.tms) strapi.tms = {};
  const reloadConfig = () => {
    strapi.tms.config = readConfig();
  };
  const saveConfig = () => {
    if (strapi?.tms?.config) writeConfig(strapi.tms.config);
  };

  reloadConfig(); // Set tms.config
  strapi.tms.reloadConfig = reloadConfig;
  strapi.tms.saveConfig = saveConfig;
};
function readConfig() {
  const data = fs.readFileSync(config_path, "utf-8");
  return JSON.parse(data);
}

function writeConfig(data) {
  fs.writeFileSync(config_path, JSON.stringify(data));
}
