import axios from "axios";
import { filterByValue, filterXMLFiles } from "../utils.mjs";

const API_URL = "https://api.up42.com";
const SATELLITES = ["PHR", "PNEO"];
const API_FILTER = {
  op: "and",
  args: [
    {
      op: "or",
      args: [],
    },
  ],
};

SATELLITES.forEach((s) => {
  API_FILTER.args[0].args.push({
    op: "=",
    args: [{ property: "constellation" }, s],
  });
});

export default class UP42 {
  constructor(context) {
    if (context.options.help) {
      console.log(`\n======================= UP42 Usage =======================
    Environment Variables:
      UP42_USERNAME    : Optional. UP42 username for token authentication.
      UP42_PASSWORD    : Optional. UP42 password for token authentication.`);
      return null;
    }

    this.UP42_USERNAME = context.UP42_USERNAME;
    this.UP42_PASSWORD = context.UP42_PASSWORD;
    this.API_LIMIT = context.API_LIMIT || 10000;
    this.ACCESS_TOKEN = null;
    this.REFRESH_TOKEN = null;
    this.debug = context.options.debug;
  }

  async init() {
    if (!this.UP42_USERNAME && !this.UP42_PASSWORD) return null;
    console.log(`${new Date().toISOString()} :: Creating UP42 connection`);
    let tokens;
    try {
      tokens = await this.fetchTokens();
    } catch (e) {
      console.error(`Error retrieving UP42 access token: ${e}`);
    }
    this.ACCESS_TOKEN = tokens[0];
    this.REFRESH_TOKEN = tokens[1];
  }

  async fetchTokens() {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    let urlencoded = new URLSearchParams();
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
      console.log(`${new Date().toISOString()} :: Fetching UP42 access token`);
      const response = await fetch(`${API_URL}/oauth/token`, requestParams);
      if (response.status !== 200) {
        throw new Error(`${new Date().toISOString()} :: Status code: ${response.status} response text: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`${new Date().toISOString()} :: UP42 access token fetched`);
      return [result.access_token, result.refresh_token];
    } catch (error) {
      throw new Error(`${new Date().toISOString()} :: Error fetching UP42 access token: ${error}`);
    }
  }

  async getCaptures(startDate, endDate) {
    const dateRange = startDate + (endDate ? "/" + endDate : "/..");
    let myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${this.ACCESS_TOKEN}`);
    myHeaders.append("Content-Type", "application/json");
    const requestParams = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ datetime: dateRange, limit: this.API_LIMIT, filter: API_FILTER }),
      redirect: "follow",
    };
    try {
      console.log(`${new Date().toISOString()} :: Fetching UP42 captures`);
      let response = await fetch(`${API_URL}/v2/assets/stac/search`, requestParams);
      if (response.status == 401) {
        const tokens = await this.fetchTokens();
        this.ACCESS_TOKEN = tokens[0];
        this.REFRESH_TOKEN = tokens[1];
        return await this.getCaptures(startDate, endDate);
      } else if (response.status !== 200) {
        throw new Error(`${new Date().toISOString()} :: Status code: ${response.status} response text: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async processResponseData(data) {
    const headers = {
      Authorization: `Bearer ${this.ACCESS_TOKEN}`,
    };

    for (let feature of data.features) {
      if (this.debug == 2) console.log(feature);
      for (const [filename, asset] of Object.entries(feature.assets)) {
        try {
          feature.assets[filename]["filename"] = filename;
          // The standard metadata files only have 2 roles attached to them
          if (asset.type === "application/xml" && asset.roles.length == 2 && !asset.roles.includes("bundle")) {
            this.debug && console.log(`${new Date().toISOString()} :: Pulling XML file: ${filename}`);
            const response = await axios.get(asset.href, { responseType: "arraybuffer", headers: headers });
            let xmlMatch = filterXMLFiles(this.debug, filename, response.data, "METADATA_PROFILE", SATELLITES);
            if (xmlMatch) {
              feature.assets[filename]["fileData"] = response.data;
            } else {
              delete feature.assets[filename];
            }
          } else if (asset.type === "image/jpeg") {
            this.debug && console.log(`${new Date().toISOString()} :: Pulling preview jpeg: ${filename}`);
            const response = await axios.get(asset.href, { responseType: "arraybuffer", headers: headers });
            feature.assets[filename]["fileData"] = response.data;
          } else if (asset.type === "application/geo+json") {
            this.debug && console.log(`${new Date().toISOString()} :: Pulling geojson: ${filename}`);
            const response = await axios.get(asset.href, { responseType: "arraybuffer", headers: headers });
            feature.assets[filename]["fileData"] = response.data;
          } else {
            delete feature.assets[filename];
          }
        } catch (error) {
          console.error(`${new Date().toISOString()} :: Error pulling file ${filename}: `, error.message);
        }
      }
    }

    let captures = [];

    for (let feature of data.features) {
      captures.push({
        xmls: Object.values(filterByValue(feature.assets, "type", ["application/xml"])),
        supporting: Object.values(filterByValue(feature.assets, "type", ["image/jpeg", "application/geo+json"])),
      });
    }

    return captures;
  }
}
