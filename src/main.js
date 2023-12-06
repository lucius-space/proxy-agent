const { UP42_Connection } = require("./up42-auth.js");
const { fetchAllCollections } = require("./stac-collections.js");
const {
  fetchAllCollectionStacItems,
  fetchXmlAssets,
} = require("./stac-items.js");

const UP42_CONNECTION = new UP42_Connection(
  process.env.UP42_USERNAME,
  process.env.UP42_PASSWORD
);

const UP42_CONNECTION_INIT = UP42_CONNECTION.fetchAccessToken();

const COLLECTION_IDS = UP42_CONNECTION_INIT.then(() => {
  return fetchAllCollections(UP42_CONNECTION.accessToken);
});

const PASSING_OBJECT = COLLECTION_IDS.then(async (COLLECTION_IDS) => {
  var collectionObjects = [];
  var xmlAssets = [];
  try {
    for (collection of COLLECTION_IDS) {
      items = await fetchAllCollectionStacItems(
        UP42_CONNECTION.accessToken,
        collection
      );
      if (items.length === 0) {
        throw new Error("No items found for collection: " + collection);
      }
      xmlAssets.push(fetchXmlAssets(items));
      // collectionObjects.push({ [collection]: items });
    }
    tempHandleXMl(xmlAssets);
    return collectionObjects;
  } catch (error) {
    throw error;
  }
});

PASSING_OBJECT.then((result) => {
  // console.log(JSON.stringify(result, null, 2));
});

//WORK IN PROGRESS CODE
//WIP
const fs = require("fs");

// WIP
function tempHandleXMl(xmlAssets) {
  // console.log(xmlAssets);
  var temp = xmlAssets[0];
  console.log(temp);
  Object.entries(temp).forEach(async ([key, value]) => {
    try {
      response = await xmlRequest(
        value.href,
        "GET",
        UP42_CONNECTION.accessToken
      );
      fs.writeFileSync(`./data/${key}`, response);
    } catch (error) {
      throw error;
    }
  });
  // console.log(temp);
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
      throw new Error(
        "Status code: " +
          response.status +
          " response text: " +
          response.statusText
      );
    }
    return response.text();
  } catch (error) {
    throw error;
  }
}
//
