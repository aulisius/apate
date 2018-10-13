import React from "react";
import ReactDOM from "react-dom";
import createStore from "ducks";
import AppContainer from "./container";

const initialState = window.___INITIAL_STATE__;

const store = createStore(initialState);

const MOUNT_NODE = document.getElementById("root");

let render = () => {
  ReactDOM.render(<AppContainer store={store} />, MOUNT_NODE);
};

if (process.env.NODE_ENV !== "production") {
  if (module.hot) {
    const renderApp = render;
    const renderError = error => {
      const RedBox = require("redbox-react").default;

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
    };

    render = () => {
      try {
        renderApp();
      } catch (error) {
        console.error(error);
        renderError(error);
      }
    };
  }
}

render();
