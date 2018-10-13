import { all } from "redux-saga/effects";
import { rootSagas } from "../root/sagas";
export default function* mainSaga() {
  yield all(rootSagas);
}
