const sleep = sleepTime =>
  new Promise(resolve => setTimeout(resolve, sleepTime));

const call = (method, url, queryParams = {}, body = {}) => {
  let requestOpts = {
    method
  };
  switch (method) {
    case "POST":
    case "DELETE":
    case "PUT":
      Object.assign(requestOpts, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json"
        }
      });
      break;
    case "FILE":
      let file = new FormData();
      file.append("file", body);
      Object.assign(requestOpts, {
        method: "POST",
        mode: "cors",
        body: file
      });
      break;
    default:
      break;
  }

  return fetch(helpers.addQueryParamsToUrl(url, queryParams), requestOpts)
    .then(helpers.checkForError)
    .catch(helpers.logError);
};

const api = {
  get: (...args) => call("GET", ...args),
  post: (...args) => call("POST", ...args),
  delete: (...args) => call("DELETE", ...args),
  postBody: (url, body) => call("POST", url, {}, body),
  call,
  sleep
};

const helpers = {
  addQueryParamsToUrl: (url, queryParams = {}) =>
    Object.keys(queryParams).reduce((qUrl, key, index) => {
      const qpValue = queryParams[key];
      // Expecting a single level of hierarchy
      // If its more than we have to change this into a recursive function
      const qpString = Array.isArray(qpValue)
        ? qpValue.reduce(
            (qpString, item, itemIndex) =>
              `${qpString}${
                itemIndex > 0 ? "&" : ""
              }${key}=${encodeURIComponent(item)}`,
            ""
          )
        : `${key}=${encodeURIComponent(qpValue)}`;
      return index > 0 ? `${qUrl}&${qpString}` : `${qUrl}?${qpString}`;
    }, url),
  checkForError: response => {
    if (!response.ok) {
      let apiFailure = new Error(response.statusText);
      apiFailure.status = response.status;
      apiFailure.response = response;
      throw apiFailure;
    }
    return response.json();
  },
  logError: error => {
    console.error("API Call failed", error);
    throw error;
  }
};

export default api;
