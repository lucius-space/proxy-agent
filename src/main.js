const { newHttpRequest } = require("./http.js");
const { TokenManager } = require("./oauth.js"); // Adjust the path as necessary

// let currentAccessToken; <-- For event fetching

const tokenManager = new TokenManager(
  process.env.UP42_USERNAME,
  process.env.UP42_PASSWORD
);

// Listen for the 'newToken' event  <-- For event fetching
// tokenManager.on("newToken", (token) => {
//   currentAccessToken = token;
// });

tokenManager.initialized
  .then(() => {
    console.log("TokenManager initialized");
    return tokenManager.accessToken; // assuming accessToken is set in TokenManager
    // console.log(currentAccessToken);
  })
  .then((accessToken) => {
    newHttpRequest(
      "https://api.up42.com/v2/assets/stac/collections",
      "GET",
      accessToken
    );

    // newHttpRequest(
    //   "https://api.up42.com/v2/assets/stac/collections/{collection-id}",
    //   "GET",
    //   accessToken
    // );
  })
  .catch((error) => console.error("Error:", error));
