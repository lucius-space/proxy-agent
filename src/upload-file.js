const http = require("http");
const https = require("https");
const FormData = require("form-data");
const url = require("url");

const uploadFile = (fileData, filename, apiUrl, token) => {
  const formData = new FormData();
  formData.append("file", fileData, filename);

  // Parse the URL to determine the protocol
  const parsedUrl = new URL(apiUrl);
  const httpModule = parsedUrl.protocol === "https:" ? https : http;

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: "POST",
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${token}`, // Include if your API requires authentication
    },
  };

  const req = httpModule.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (e) => {
    console.error(e);
  });

  formData.pipe(req);
};

module.exports = {
  uploadFile,
};
