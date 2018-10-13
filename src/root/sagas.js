import { takeEvery, put } from "redux-saga/effects";
import { services } from "./services";
import { actions, actionTypes } from "./ducks";
import { onSuccess } from "@faizaanceg/redux-side-effect";

export const rootSagas = [
  takeEvery(
    [actionTypes.LOGIN_REQUEST, onSuccess(actionTypes.SIGNUP_REQUEST)],
    doLogin
  ),
  takeEvery(actionTypes.LOGOUT_REQUEST, doLogout),
  takeEvery(actionTypes.SIGNUP_REQUEST, doSignup)
];

function* doSignup(action) {
  const response = yield services.doSignup(action.user);
  yield put(actions.signupSuccess(response));
}

function* doLogin(action) {
  try {
    const response = yield services.doLogin(action.user);
    yield put(actions.loginSuccess(response));
  } catch (error) {
    yield put(actions.loginFailure(error));
  }
}

function* doLogout(action) {
  try {
    yield services.doLogout();
    yield put(actions.logoutSuccess());
  } catch (error) {
    yield put(actions.logoutFailure(error));
  }
}
