const { request } = require("./http.js");
// In oauthModule.js

async function fetchAllCollections(accessToken) {
  const address = "https://api.up42.com/v2/assets/stac/collections";
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    collections = response.collections;
    collection_ids = collections.map((collection) => {
      return collection.id;
    });
    return collection_ids;
  } catch (error) {
    throw error;
  }
}

async function fetchCollection(accessToken, collectionId) {
  const address =
    "https://api.up42.com/v2/assets/stac/collections/" + collectionId;
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchAllCollections, fetchCollection };

//fetch collections
//for each collection, fetch stac items
