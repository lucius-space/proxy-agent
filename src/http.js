async function request(address, methodType, accessToken) {
  console.log("New HTTP request to:", address);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + accessToken);
  var requestOptions = {
    method: methodType,
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const response = await fetch(address, requestOptions);
    if (response.status > 299) {
      throw new Error(
        "Status code: " +
          response.status +
          " response text: " +
          response.statusText
      );
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = { request };
