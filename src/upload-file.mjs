import http from "http";
import https from "https";
import FormDataOld from "form-data";
import { URL } from "url";
import { uploadFiles, updateFile, readItem } from "@directus/sdk";

export const uploadXMLFile = async (context, xml) => {
  context.options.debug && console.log(`${new Date().toISOString()} :: Uploading capture XML ${xml.filename}`);
  const formData = new FormDataOld();
  formData.append("file", Buffer.from(xml.fileData, "utf-8"), xml.filename);

  // Parse the URL to determine the protocol
  const parsedUrl = new URL(`${context.LUCIUS_API_URL}/import/capture`);
  const httpModule = parsedUrl.protocol === "https:" ? https : http;

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: "POST",
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${context.LUCIUS_API_KEY}`, // Include if your API requires authentication
    },
  };

  let p = new Promise((resolve, reject) => {
    const req = httpModule.request(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        resolve(JSON.parse(responseBody));
      });
    });
    req.on("error", (err) => {
      reject(err);
    });

    formData.pipe(req);
  });
  let record_mapping;
  try {
    record_mapping = await p;
  } catch (e) {
    console.error(`Error uploading XML file ${xml.filename} for processing: ${e}`);
  }
  try {
    const record = await context.db.request(
      readItem("captures", record_mapping[0].record_id, {
        fields: ["id", "assets.directus_files_id.filename_download"],
      })
    );

    record_mapping[0]["assets"] = record.assets.length ? record.assets?.map((fid) => fid?.directus_files_id?.filename_download) : [];
  } catch (e) {
    console.error(`Error retrieving existing supporting assets for capture record_mapping ${JSON.stringify(record_mapping)}: ${JSON.stringify(e)}`);
  }

  if (!record_mapping[0].assets.includes(xml.filename)) {
    try {
      await uploadSupporting(context, xml, record_mapping[0]);
    } catch (e) {
      console.error(`Error uploading XML file ${xml.filename} as supporting asset: ${e}`);
    }
  } else {
    context.options.debug && console.log(`${new Date().toISOString()} :: File already exists: ${xml.filename}`);
  }

  return record_mapping;
};

export const uploadSupporting = async (context, supporting, record) => {
  try {
    if (!record.assets.includes(supporting.filename)) {
      context.options.debug && console.log(`${new Date().toISOString()} :: Uploading supporting file ${supporting.filename}`);
      const file = new Blob([supporting.fileData], { type: supporting.type });
      const formData = new FormData();
      formData.append("file", file, supporting.filename);
      let data;
      try {
        data = await context.db.request(uploadFiles(formData));
      } catch (e) {
        console.error(`Error uploading supporting file ${supporting.filename} for processing: ${e}`);
      }
      try {
        await context.db.request(
          updateFile(data.id, {
            captures: {
              create: [
                {
                  directus_files_id: data.id,
                  captures_id: {
                    id: record.record_id,
                  },
                },
              ],
              update: [],
              delete: [],
            },
          })
        );
      } catch (e) {
        console.error(`Error updating supporting file ${supporting.filename} relationship: ${e}`);
      }
    } else {
      context.options.debug && console.log(`${new Date().toISOString()} :: File already exists: ${supporting.filename}`);
    }
  } catch (e) {
    console.error(e);
  }
};
