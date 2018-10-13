import { onFailure, onSuccess } from "@faizaanceg/redux-side-effect";
export const actionTypes = {
  LOGIN_REQUEST: "[Apate] Login request",
  LOGOUT_REQUEST: "[Apate] Logout request",
  SIGNUP_REQUEST: "[Apate] Signup request",
  RESET_STATE: "[Apate] Reset state"
};

export const initialState = {
  loggedIn: false,
  userInfo: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.RESET_STATE:
      return initialState;

    case onSuccess(actionTypes.LOGIN_REQUEST):
      return {
        ...state,
        userInfo: action.payload,
        loggedIn: true
      };
    case onSuccess(actionTypes.LOGOUT_REQUEST):
      return {
        ...state,
        loggedIn: false
      };
    default:
      return state;
  }
};

export const actions = {
  resetState() {
    return {
      type: actionTypes.RESET_STATE
    };
  },
  loginUser(user) {
    return {
      type: actionTypes.LOGIN_REQUEST,
      user
    };
  },
  loginSuccess(payload = {}) {
    return {
      type: onSuccess(actionTypes.LOGIN_REQUEST),
      payload
    };
  },
  loginFailure(error) {
    return {
      type: onFailure(actionTypes.LOGIN_REQUEST),
      error
    };
  },
  logoutUser() {
    return {
      type: actionTypes.LOGOUT_REQUEST
    };
  },
  logoutSuccess(payload = {}) {
    return {
      type: onSuccess(actionTypes.LOGOUT_REQUEST),
      payload
    };
  },
  logoutFailure(error) {
    return {
      type: onFailure(actionTypes.LOGOUT_REQUEST),
      error
    };
  },
  signupUser(user) {
    return {
      type: actionTypes.SIGNUP_REQUEST,
      user
    };
  },
  signupSuccess(payload = {}) {
    return {
      type: onSuccess(actionTypes.SIGNUP_REQUEST),
      payload
    };
  },
  signupFailure(error) {
    return {
      type: onFailure(actionTypes.SIGNUP_REQUEST),
      error
    };
  }
};
