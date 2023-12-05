const { request } = require("./http.js");
// In oauthModule.js

async function fetchAllCollections(accessToken) {
  console.log("Fetching all collections");
  const address = "https://api.up42.com/v2/assets/stac/collections";
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    var collections = response.collections;
    var collection_ids = collections.map((collection) => {
      return collection.id;
    });
    console.log("Returning fetched collections");
    return collection_ids;
  } catch (error) {
    throw error;
  }
}

async function fetchCollection(accessToken, collectionId) {
  console.log("Fetching collection: " + collectionId);
  const address =
    "https://api.up42.com/v2/assets/stac/collections/" + collectionId;
  const method = "GET";
  try {
    const response = await request(address, method, accessToken);
    console.log("Returning fetched collection: " + collectionId);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchAllCollections, fetchCollection };
