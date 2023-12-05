async function request(address, methodType, accessToken) {
  // console.log("New HTTP request to:", address);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + accessToken);
  const requestParams = {
    method: methodType,
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const response = await fetch(address, requestParams);
    if (response.status > 299) {
      throw new Error(
        "Status code: " +
          response.status +
          " response text: " +
          response.statusText
      );
    }
    const result = await response.json();
    // console.log("Returning HTTP response from:", address);
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = { request };
