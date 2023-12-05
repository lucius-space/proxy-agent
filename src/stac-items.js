const { request } = require("./http.js");
// In oauthModule.js

async function fetchAllCollectionItems(accessToken, collectionId) {
  const address =
    "https://api.up42.com/v2/assets/stac/collections/" +
    collectionId +
    "/items";
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    // Buisness logic goes here
    return response;
  } catch (error) {
    throw error;
  }
}

async function fetchCollectionItem(accessToken, collectionId, itemId) {
  const address =
    "https://api.up42.com/v2/assets/stac/collections/" +
    collectionId +
    "/items/" +
    itemId;
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchAllCollectionItems, fetchCollectionItem };

//fetch collections
//for each collection, fetch stac items
