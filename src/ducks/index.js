import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";

import rootReducer from "../root/ducks";

import { snitchReducer, snitchMiddleware } from "@faizaanceg/snitch";
import {
  sideEffectMiddleware,
  sideEffectReducer
} from "@faizaanceg/redux-side-effect";

import mainSaga from "sagas";

const sagaMiddleware = createSagaMiddleware();
let middleware = [
  sagaMiddleware,
  snitchMiddleware("modals"),
  sideEffectMiddleware("apiStatus")
];

if (process.env.NODE_ENV === "development") {
  const { createLogger } = require("redux-logger");
  middleware.push(createLogger());
}

const mainReducer = () =>
  combineReducers({
    apiStatus: sideEffectReducer,
    root: rootReducer,
    modals: snitchReducer
  });

let _compose = compose;

//Compose with dev tools extension in case of DEV environment
if (
  process.env.NODE_ENV === "development" &&
  typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === "function"
) {
  _compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
}

export default (initialState = {}) => {
  const store = createStore(
    mainReducer(),
    initialState,
    _compose(applyMiddleware(...middleware))
  );
  sagaMiddleware.run(mainSaga);
  store.asyncReducers = {};
  return store;
};
