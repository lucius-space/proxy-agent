import dotenv from "dotenv";
import fs from "fs";
import commandLineArgs from "command-line-args";
import { createDirectus, rest, staticToken } from "@directus/sdk";
import { intervalFetch } from "./main.mjs";

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

// Import all provider modules
const PROVIDERS_FOLDER = "./src/providers";
let provider_files = fs.readdirSync(PROVIDERS_FOLDER);
let providers = [];
// for (const file of provider_files) {
//   const { default: provider } = await import(`../${PROVIDERS_FOLDER}/${file}`);
//   providers.push(new provider(options));
// }
// esbuild, used for packaging, doesn't seem to support dynamic imports at this time so we'll manually import providers for now.
import UP42 from "./providers/up42.mjs";
providers.push(new UP42(options));

if (options.help) process.exit(0);

if (options.dryRun) fs.mkdirSync("send", { recursive: true });

let context = {
  LUCIUS_API_URL: process.env.LUCIUS_API_URL || "https://lucius-space.directus.app",
  LUCIUS_API_KEY: process.env.LUCIUS_API_KEY,
  options: options,
};

console.log(context.LUCIUS_API_URL);

if (!context.LUCIUS_API_URL || !context.LUCIUS_API_KEY) {
  throw new Error("Both LUCIUS_API_URL and LUCIUS_API_KEY need to be defined");
}

const main = async () => {
  for (const provider of providers) {
    await provider.init();
  }
  context["db"] = createDirectus(context.LUCIUS_API_URL).with(staticToken(context.LUCIUS_API_KEY)).with(rest());
  intervalFetch(context, providers);
};

main().catch((err) => console.error(err));
