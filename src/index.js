import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3004";
axios.defaults.headers.post["Content-Type"] = "application/json";

axios.interceptors.request.use(
  request => {
    return request;
  },
  error => {
    alert("Something goes wrong! check json-server!");
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    alert("Something goes wrong! check json-server!");
    return Promise.reject(error);
  }
);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
