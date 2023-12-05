// In oauthModule.js

class UP42_Connection {
  constructor(UP42_USERNAME, UP42_PASSWORD) {
    this.address = "https://api.up42.com/oauth/token";
    this.UP42_USERNAME = UP42_USERNAME;
    this.UP42_PASSWORD = UP42_PASSWORD;
    this.accessToken = null;
    console.log("Creating UP42_Connection.");
  }

  async initOauth() {
    console.log("Initializing UP42_Connection.");
    try {
      await this.fetchCredentials();
      return;
    } catch (error) {
      throw error;
    }
  }

  async fetchCredentials() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "password");
    urlencoded.append("username", this.UP42_USERNAME);
    urlencoded.append("password", this.UP42_PASSWORD);
    const requestParams = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };
    try {
      console.log("Fetching UP42 access token.");
      const response = await fetch(this.address, requestParams);
      if (response.status !== 200) {
        throw new Error(
          "Status code: " +
            response.status +
            " response text: " +
            response.statusText
        );
      }
      const result = await response.json();
      this.accessToken = result.access_token;
      return;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { UP42_Connection };

//   async fetch_credentials() {
//     try {
//       // Error handling can be improved here
//       console.log("Fetching new access token.");
//       const response = await fetch(this.address, this.build_request());
//       if (response.status === 401) {
//         throw new Error("Invalid credentials");
//       }
//       if (response.status === 429) {
//         throw new Error("Too many requests");
//       }
//       if (response.status === 200) {
//         console.log("Successfully fetched access token.");
//       }
//       const result = await response.json();
//       this.accessToken = result.access_token;
//       this.refreshToken = result.refresh_token;

//       // this.emit("newToken", this.accessToken); <-- When event fetching is fixed in main.js

//       setTimeout(() => {
//         this.fetch_credentials();
//       }, 300000); // 300000 milliseconds = 5 minutes
//     } catch (error) {
//       console.error("Error fetching credentails:", error);
//     }
//   }

//   build_request() {
//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
//     var urlencoded = new URLSearchParams();
//     if (this.refreshToken === null) {
//       urlencoded.append("grant_type", "password");
//       urlencoded.append("username", this.UP42_USERNAME);
//       urlencoded.append("password", this.UP42_PASSWORD);
//     } else {
//       urlencoded.append("grant_type", "refresh_token");
//       urlencoded.append("refreshToken", this.refreshToken);
//     }
//     return {
//       method: "POST",
//       headers: myHeaders,
//       body: urlencoded,
//       redirect: "follow",
//     };
//   }
// }
