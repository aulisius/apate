import React, { Fragment } from "react";
import { Link, Router } from "@reach/router";
import { actions } from "../root/ducks";
import { connect } from "react-redux";
import { Video } from "../video";
import Root from "../root/index";

import { Formik, Form, Field } from "formik";
import { BrowseVideos } from "../browse";

// import { InlineNotification } from "./inline-notif";

// import { onSuccess, onFailure } from "@faizaanceg/redux-side-effect";

class Home extends React.Component {
  static mapStateToProps = state => state.root;

  static mapDispatchToProps = actions;

  render() {
    return (
      <div>
        <div className="main">
          <div className="container-fluid">
            <header className="w-75 mx-auto">
              <div className="row">
                <div className="col-md-6">
                  <div className="logo">
                    <a>APATE</a>
                  </div>
                </div>
                {!this.props.loggedIn && (
                  <div className="col">
                    <Formik
                      initialValues={{
                        username: "",
                        password: ""
                      }}
                      onSubmit={this.props.loginUser}
                      render={({ touched, isValid }) => (
                        <Form className="form-inline">
                          <div className="col pr-0">
                            <div className="input-group">
                              <span
                                className="input-group-addon"
                                id="basic-addon1"
                              >
                                @
                              </span>
                              <Field
                                type="email"
                                required={touched.username}
                                className="form-control"
                                name="username"
                                placeholder="Username"
                                aria-label="Username"
                                aria-describedby="basic-addon1"
                              />
                            </div>
                          </div>
                          <div className="col">
                            <div className="input-group">
                              <Field
                                type="password"
                                name="password"
                                required={touched.password}
                                className="form-control"
                                placeholder="Password"
                                aria-label="Password"
                              />
                            </div>
                          </div>
                          <div className="col pl-0">
                            <button
                              type="submit"
                              disabled={!isValid}
                              className="btn btn-lined"
                            >
                              Login
                            </button>
                          </div>
                        </Form>
                      )}
                    />
                  </div>
                )}
                {this.props.loggedIn && (
                  <Fragment>
                    <div className="col offset-md-2 text-right">
                      <div className="logo">
                        <a className="mx-auto">
                          {this.props.userInfo.username}
                        </a>
                      </div>
                    </div>
                    <div className="col">
                      <button
                        className="btn btn-lined"
                        onClick={this.props.logoutUser}
                      >
                        Logout
                      </button>
                    </div>
                  </Fragment>
                )}
              </div>
            </header>
            <Router>
              <Root path="/" loggedIn={this.props.loggedIn} />
              <BrowseVideos path="/browse" />
              <Video loggedIn={this.props.loggedIn} path="/watch/:videoId" />
            </Router>
          </div>

          <br />
          <br />
          <br />

          <footer className="footer">
            <div className="container">
              <div className="row">
                <div className="col-md">
                  <span>
                    ©<span className="pl-2">{new Date().getFullYear()}</span>
                  </span>
                </div>
                <div className="col-md text-right designed">
                  <span>
                    Designed by
                    <a className="pl-1">Apate</a>
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }
}

export default connect(
  Home.mapStateToProps,
  Home.mapDispatchToProps
)(Home);
