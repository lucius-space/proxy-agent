import fs from "fs";
import { createDirectus, rest, staticToken } from "@directus/sdk";
import { uploadXMLFile, uploadSupporting } from "./upload-file.mjs";
import { toRFC3339, isDateInPast } from "./utils.mjs";

// Import all provider modules
// const PROVIDERS_FOLDER = "./src/providers";
// let provider_files = fs.readdirSync(PROVIDERS_FOLDER);
// let providers = [];
// for (const file of provider_files) {
//   const { default: provider } = await import(`../${PROVIDERS_FOLDER}/${file}`);
//   providers.push(new provider(options));
// }
// esbuild, used for packaging, doesn't seem to support dynamic imports at this time so we'll manually import providers for now.
import UP42 from "./providers/up42.mjs";

const millisecondsInADay = 24 * 60 * 60 * 1000;

export const main = async (context) => {
  let providers = [];
  if (!providers.filter((arr) => arr instanceof UP42).length) {
    providers.push(new UP42(context));
  }
  for (const provider of providers) {
    try {
      await provider.init();
    } catch (e) {
      console.error(`Error creating provider ${provider.constructor.name}: ${e}`);
    }
  }
  context["db"] = createDirectus(context.LUCIUS_API_URL).with(staticToken(context.LUCIUS_API_KEY)).with(rest());
  intervalFetch(context, providers);
};

const intervalFetch = async (context, providers) => {
  const interval = context.options.interval * 60 * 1000;
  let startDate = toRFC3339(context.options.startDate);
  let endDate = context.options.endDate ? toRFC3339(context.options.endDate) : null;

  do {
    for (const p of providers) {
      let loopStartDate = new Date(startDate);
      let loopEndDate = endDate ? new Date(endDate) : new Date();
      while (loopStartDate <= loopEndDate) {
        let currentEndDate = new Date(loopStartDate.getTime() + millisecondsInADay / 2);
        currentEndDate = loopEndDate < currentEndDate ? loopEndDate : currentEndDate;
        const data = await p.getCaptures(toRFC3339(loopStartDate), toRFC3339(currentEndDate));
        const captures = await p.processResponseData(data);

        for (const capture of captures) {
          let record = null;
          if (capture?.xmls) {
            for (const xml of capture.xmls) {
              if (context.options.dryRun) {
                console.log(`${new Date().toISOString()} :: Dry run saving capture XML ${xml.filename}`);
                fs.writeFileSync(`./send/${xml.filename}`, xml.fileData);
              } else {
                let record_mapping = await uploadXMLFile(context, xml);
                record = record_mapping[0];
              }
            }
          }
          if (capture?.supporting) {
            await Promise.all(
              capture.supporting.map(async (supporting) => {
                if (context.options.dryRun) {
                  console.log(`${new Date().toISOString()} :: Dry run saving capture supporting ${supporting.filename}`);
                  fs.writeFileSync(`./send/${supporting.filename}`, supporting.fileData);
                } else if (record) {
                  await uploadSupporting(context, supporting, record);
                }
              })
            );
          }
        }
        loopStartDate = currentEndDate;
      }
    }

    if (endDate && isDateInPast(endDate)) {
      console.log(`${new Date().toISOString()} :: End date ${endDate} reached, exiting...`);
      break;
    }

    if (context.options.debug) {
      const nextFetch = new Date(new Date().getTime() + interval).toISOString();
      console.log(`\n${new Date().toISOString()} :: Captures pulled and uploaded to LUCIUS. Will conduct next fetch in ${interval / (60 * 1000)} minutes at ${nextFetch}\n`);
    }

    startDate = new Date().toISOString(); // Update the start date to the current time
    await new Promise((resolve) => setTimeout(resolve, interval));
  } while (!endDate || !isDateInPast(endDate));
};
