import fs from "fs";
import { uploadXMLFile, uploadSupporting } from "./upload-file.mjs";
import { toRFC3339, isDateInPast } from "./utils.mjs";

export const intervalFetch = async (context, providers) => {
  const interval = context.options.interval * 60 * 1000;
  let startDate = toRFC3339(context.options.startDate);
  let endDate = context.options.endDate ? toRFC3339(context.options.endDate) : null;

  do {
    for (const p of providers) {
      const data = await p.getCaptures(startDate, endDate);
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
          for (const supporting of capture.supporting) {
            if (context.options.dryRun) {
              console.log(`${new Date().toISOString()} :: Dry run saving capture supporting ${supporting.filename}`);
              fs.writeFileSync(`./send/${supporting.filename}`, supporting.fileData);
            } else if (record) {
              await uploadSupporting(context, supporting, record);
            }
          }
        }
      }
    }

    if (endDate && isDateInPast(endDate)) {
      console.log("${new Date().toISOString()} :: End date reached, exiting...");
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
