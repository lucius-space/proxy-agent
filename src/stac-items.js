const { request } = require("./http.js");
// In oauthModule.js

async function fetchAllCollectionStacItems(accessToken, collectionId) {
  console.log("Fetching all stac items for collection: " + collectionId);
  const address =
    "https://api.up42.com/v2/assets/stac/collections/" +
    collectionId +
    "/items";
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    var features = response.features;
    console.log("Returning fetched stac items for collection: " + collectionId);
    return features;
  } catch (error) {
    throw error;
  }
}

async function fetchCollectionStacItem(accessToken, collectionId, itemId) {
  console.log(
    "Fetching stac item: " + itemId + " for collection: " + collectionId
  );
  const address =
    "https://api.up42.com/v2/assets/stac/collections/" +
    collectionId +
    "/items/" +
    itemId;
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    console.log("Returning fetched stac item: " + itemId);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchAllCollectionStacItems, fetchCollectionStacItem };

//fetch collections
//for each collection, fetch stac items
