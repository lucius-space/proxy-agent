import http from "http";
import https from "https";
import FormDataOld from "form-data";
import { URL } from "url";
import { uploadFiles, updateFile, readItem } from "@directus/sdk";

export const uploadXMLFile = async (context, xml) => {
  console.log(`${new Date().toISOString()} :: Uploading capture XML ${xml.filename}`);
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
  let record_mapping = await p;

  const record = await context.db.request(
    readItem("captures", record_mapping[0].record_id, {
      fields: ["id", "assets.directus_files_id.filename_download"],
    })
  );

  record_mapping[0]["assets"] = record.assets.length ? record.assets?.map((fid) => fid?.directus_files_id?.filename_download) : [];

  if (!record_mapping[0].assets.includes(xml.filename)) {
    await uploadSupporting(context, xml, record_mapping[0]);
  } else {
    console.log(`${new Date().toISOString()} :: File already exists: ${xml.filename}`);
  }

  return record_mapping;
};

export const uploadSupporting = async (context, supporting, record) => {
  try {
    if (!record.assets.includes(supporting.filename)) {
      console.log(`${new Date().toISOString()} :: Uploading supporting file ${supporting.filename}`);
      const file = new Blob([supporting.fileData], { type: supporting.type });
      const formData = new FormData();
      formData.append("file", file, supporting.filename);
      const data = await context.db.request(uploadFiles(formData));
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
    } else {
      console.log(`${new Date().toISOString()} :: File already exists: ${supporting.filename}`);
    }
  } catch (e) {
    console.error(e);
  }
};
