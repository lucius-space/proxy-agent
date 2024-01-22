import dotenv from "dotenv";
import fs from "fs";
import commandLineArgs from "command-line-args";
import { main } from "./main.mjs";

dotenv.config();

const optionDefinitions = [
  { name: "startDate", type: String, defaultValue: new Date() },
  { name: "endDate", type: String, defaultValue: null },
  { name: "interval", type: Number, defaultValue: 15 },
  { name: "debug", type: Boolean, defaultValue: false },
  { name: "dryRun", type: Boolean, defaultValue: false },
  { name: "help", type: Boolean, defaultValue: false },
];
const options = commandLineArgs(optionDefinitions);

if (options.help) {
  console.log(`======================= General Proxy Options =======================
    --startDate   : Start date for the data fetch in YYYY-MM-DD format. If no value provided, defaults to today's date
    --endDate     : End date for the data fetch in YYYY-MM-DD format. If no value provided, will continue to fetch indefinitely.
    --interval    : How often to fetch updates in minutes. Defaults to 15 minutes
    --debug       : Enables debug mode for additional logging.
    --dryRun      : Saves what files would be sent to the Lucius platform in the './send/' folder without actually sending anything.
    --help        : Displays this help message.

  Environment Variables:
    LUCIUS_API_URL   : The API URL for Lucius. If none provided, defaults to https://app.lucius.space
    LUCIUS_API_KEY   : Required. The API key for Lucius.`);
}

if (options.help) process.exit(0);

if (options.dryRun) fs.mkdirSync("send", { recursive: true });

let context = {
  LUCIUS_API_URL: process.env.LUCIUS_API_URL || "https://lucius-space.directus.app",
  LUCIUS_API_KEY: process.env.LUCIUS_API_KEY,
  options: options,
};

if (!context.LUCIUS_API_URL || !context.LUCIUS_API_KEY) {
  throw new Error("Both LUCIUS_API_URL and LUCIUS_API_KEY need to be defined");
}

export default main;

main(context).catch((err) => console.error(err));
