// In oauthModule.js

class UP42_Connection {
  constructor(UP42_USERNAME, UP42_PASSWORD) {
    this.address = "https://api.up42.com/oauth/token";
    this.UP42_USERNAME = UP42_USERNAME;
    this.UP42_PASSWORD = UP42_PASSWORD;
    this.accessToken = null;
    console.log("Creating UP42_Connection");
  }

  async fetchAccessToken() {
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
      console.log("Fetching UP42 access token");
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
      console.log("UP42 access token fetched");
      return;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { UP42_Connection };
