const { XMLParser } = require("fast-xml-parser");

const { UP42_Connection } = require("./up42-auth.js");
const { fetchAllCollections } = require("./stac-collections.js");
const { fetchAllCollectionStacItems, fetchXmlAssets } = require("./stac-items.js");
const { uploadFile } = require("./upload-file.js");

const parser = new XMLParser();

const LUCIUS_API_URL = process.env.LUCIUS_API_URL || "http://localhost:8055";
const LUCIUS_API_KEY = process.env.LUCIUS_API_KEY;

const UP42_CONNECTION = new UP42_Connection(process.env.UP42_USERNAME, process.env.UP42_PASSWORD);

const UP42_CONNECTION_INIT = UP42_CONNECTION.fetchAccessToken();

const COLLECTION_IDS = UP42_CONNECTION_INIT.then(() => {
  return fetchAllCollections(UP42_CONNECTION.accessToken);
});

const PASSING_OBJECT = COLLECTION_IDS.then(async (COLLECTION_IDS) => {
  var collectionObjects = [];
  var xmlAssets = [];
  try {
    for (collection of COLLECTION_IDS) {
      items = await fetchAllCollectionStacItems(UP42_CONNECTION.accessToken, collection);
      if (items.length === 0) {
        throw new Error("No items found for collection: " + collection);
      }
      xmlAssets.push(fetchXmlAssets(items));
      // collectionObjects.push({ [collection]: items });
    }
    for (const xmlGroup of xmlAssets) {
      const relevantXmls = await getRelevantXmls(xmlGroup);

      relevantXmls.forEach((xml) => {
        uploadFile(xml.file_data, xml.file_name, LUCIUS_API_URL, LUCIUS_API_KEY);
      });
    }
    return collectionObjects;
  } catch (error) {
    throw error;
  }
});

PASSING_OBJECT.then((result) => {
  // console.log(JSON.stringify(result, null, 2));
});

// WIP
// const fs = require("fs");
async function getRelevantXmls(xmlAssets) {
  let relevantXmls = [];
  for (const [key, value] of Object.entries(xmlAssets)) {
    try {
      response = await xmlRequest(value.href, "GET", UP42_CONNECTION.accessToken);

      if (response) {
        //fs.writeFileSync(`./data/${key}`, response);
        const captureJson = parser.parse(response);
        const sensor = captureJson?.Dimap_Document?.Metadata_Identification?.METADATA_PROFILE;
        // Only return XML capture files for Pleiades and Pleiades Neo
        if (sensor && /^(PHR|PNEO)/.test(sensor)) {
          relevantXmls.push({
            file_name: key,
            file_data: response,
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }
  return relevantXmls;
}

async function xmlRequest(address, methodType, accessToken) {
  // console.log("New HTTP request to:", address);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + accessToken);
  const requestParams = {
    method: methodType,
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const response = await fetch(address, requestParams);
    if (response.status > 299) {
      throw new Error("Status code: " + response.status + " response text: " + response.statusText);
    }
    return response.text();
  } catch (error) {
    throw error;
  }
}
//
