async function newHttpRequest(address, method_type, currentAccessToken) {
  console.log("Maing new HTTP request to:", address);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + currentAccessToken);
  var requestOptions = {
    method: method_type,
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(address, requestOptions);
    const result = await response.json();
    console.log("Http RequestResult:", result);
  } catch (error) {
    console.error("Error fetching request:", error);
  }
}

module.exports = { newHttpRequest };
