const { UP42_Connection } = require("./oauth.js");
const { fetchAllCollections } = require("./stac-collections.js");
const { fetchAllCollectionStacItems } = require("./stac-items.js");

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
  try {
    for (collection of COLLECTION_IDS) {
      items = await fetchAllCollectionStacItems(
        UP42_CONNECTION.accessToken,
        collection
      );
      if (items.length === 0) {
        throw new Error("No items found for collection: " + collection);
      }
      collectionObjects.push({ [collection]: items });
    }
    return collectionObjects;
  } catch (error) {
    throw error;
  }
});

PASSING_OBJECT.then((result) => {
  console.log(JSON.stringify(result, null, 2));
});

// ADD code to pass the object onto Lucios
