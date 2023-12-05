const {
  fetchAllCollections,
  fetchCollection,
} = require("./stac-collections.js");
const { UP42_Connection } = require("./oauth.js"); // Adjust the path as necessary

const UP42_CONNECTION = new UP42_Connection(
  process.env.UP42_USERNAME,
  process.env.UP42_PASSWORD
);

const UP42_CONNECTION_INIT = UP42_CONNECTION.initOauth();
const COLLECTION_IDS = UP42_CONNECTION_INIT.then(() => {
  return fetchAllCollections(UP42_CONNECTION.accessToken);
});

const placeholder = COLLECTION_IDS.then(async (COLLECTION_IDS) => {
  var test = [];
  try {
    for (collection of COLLECTION_IDS) {
      result = await fetchCollection(UP42_CONNECTION.accessToken, collection);
      test.push(result.title);
    }
    console.log(test);
    return test;
  } catch (error) {
    throw error;
  }
});
const placeholder2 = placeholder.then((test) => {
  console.log(test);
});

// .then((response) => {
//   console.log(response);
// })
// .catch((error) => {
//   throw error;
// });

// console.log("Catalog Response:" + catalogResponse);

// function getCatalog(accessToken) {
//   console.log("Fetching catalog.");
//   return new Promise((resolve, reject) => {
//     return newHttpRequest(
//       "https://api.up42.com/v2/assets/stac/collections",
//       "GET",
//       accessToken
//     )
//       .then(resolve)
//       .catch((error) => {
//         reject(error);
//       });
//   });
// }

// Listen for the 'newToken' event  <-- For event fetching
// tokenManager.on("newToken", (token) => {
//   currentAccessToken = token;
// });

// tokenManager.initialized
//   .then(() => {
//     console.log("TokenManager initialized");
//     return tokenManager.accessToken; // assuming accessToken is set in TokenManager
//     // console.log(currentAccessToken);
//   })
//   .then((accessToken) => {
//     response = newHttpRequest(
//       "https://api.up42.com/v2/assets/stac/collections",
//       "GET",
//       accessToken
//     )
//       .then((response) => {
//         links = response.links;
//         if (links.length > 0) {
//           console.log("Found links");
//           for (var i = 0; i < links.length; i++) {
//             console.log(links[i].href);
//           }
//         } else {
//           throw new Error("No links avaliable");
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   })
//   .catch((error) => console.error("Error:", error));
