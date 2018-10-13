import api from "api";
import storage from "storage";
const credentials = [
  { username: "test@gmail.com", password: "qwedsa", fullname: "Test" },
  {
    username: "hello@apate.com",
    password: "qwedsa",
    fullname: "apate"
  }
];

storage.set("users", credentials);

// Minimal login system
export const services = {
  doLogin(user) {
    const authorizedUser = storage
      .get("users", [])
      .find(
        value =>
          value.username === user.username && value.password === user.password
      );
    return authorizedUser
      ? Promise.resolve({
          username: authorizedUser.fullname
        })
      : Promise.reject("Unauthorized");
  },
  doSignup(user) {
    let exisitingCredentials = storage.get("users", []);
    exisitingCredentials.push(user);
    storage.set("users", exisitingCredentials);
    return Promise.resolve(user);
  },
  doLogout() {
    return Promise.resolve({});
    // return api.deleteCall("/api/logout");
  },
  doUpload(file) {
    //TODO: Change mock response
    return api.call("FILE", `http://localhost:5000/upload`, {}, file);
  }
};
