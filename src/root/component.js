import React, { Component, Fragment } from "react";
import { Formik, Form, Field } from "formik";
import { actionTypes } from "./ducks";
import { connect } from "react-redux";
import { actions } from "./ducks";

import { InlineNotification } from "./inline-notif";

import "./styles.scss";
import { onSuccess, onFailure } from "@faizaanceg/redux-side-effect";

class Root extends Component {
  static mapDispatchToProps = actions;

  static mapStateToProps = state => state.root;

  state = {
    signupFlow: false
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.loggedIn) {
      this.setState({
        signupFlow: false
      });
    }
  }

  handleSignup = () =>
    this.setState(
      state => ({
        signupFlow: !state.signupFlow
      }),
      () => {
        if (this.signUpForm) {
          const rect = this.signUpForm.getBoundingClientRect();
          window.scrollTo(rect.left, rect.top);
        }
      }
    );

  renderPreliminaryRiskAssessment(data = {}) {
    let results = [];
    data.financials.forEach((heading, index) => {
      let current = data.Current[index];
      results.push(
        <tr key={current}>
          {/* <th scope="row">{index + 1}</th> */}
          <td>{heading}</td>
          <td>{current}</td>
        </tr>
      );
    });
    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">#</th>
          </tr>
        </thead>
        <tbody>{results}</tbody>
      </table>
    );
  }

  render() {
    return (
      <div>
        <div className="main">
          <div className="container-fluid">
            <header className="w-75 mx-auto">
              <div className="row">
                <div className="col-md-6">
                  <div className="logo">
                    <a>Apate</a>
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
                      render={({ touched, errors, isValid }) => (
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
            <section>
              <div className="hero text-center">
                <h1 className="hero-title">Apate!</h1>
                {/* <p>Just upload your documents and you are good to go!</p> */}
                <div className="hero-buttons">
                  {!this.props.loggedIn && (
                    <a
                      role="button"
                      onClick={this.handleSignup}
                      className="btn btn-round btn-lined btn-lg"
                    >
                      Sign up
                      <div className="space" />
                      <i className="fa fa-arrow-right" aria-hidden="true" />
                    </a>
                  )}
                </div>
                {!this.props.loggedIn &&
                  this.state.signupFlow && (
                    <Formik
                      initialValues={{
                        username: "",
                        fullname: "",
                        password: ""
                      }}
                      onSubmit={this.props.signupUser}
                      render={({ touched, isValid }) => (
                        <div
                          ref={signUpForm => {
                            this.signUpForm = signUpForm;
                          }}
                          id="sign-up"
                          className="w-50 mx-auto border p-4 mt-5"
                        >
                          <Form>
                            <div className="form-row">
                              <div className="col">
                                <button
                                  onClick={this.handleSignup}
                                  type="button"
                                  className="close"
                                  aria-label="Close"
                                >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group col-md-6">
                                <label htmlFor="email">Email</label>
                                <Field
                                  type="email"
                                  name="username"
                                  required={touched.username}
                                  className="form-control"
                                  id="email"
                                  placeholder="john.doe@email.com"
                                />
                              </div>
                              <div className="form-group col-md-6">
                                <label htmlFor="password">Password</label>
                                <Field
                                  type="password"
                                  required={touched.password}
                                  name="password"
                                  className="form-control"
                                  id="password"
                                  placeholder="Password"
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group col">
                                <label htmlFor="fullname">Full name</label>
                                <Field
                                  type="text"
                                  required={touched.fullname}
                                  name="fullname"
                                  className="form-control"
                                  id="fullname"
                                  placeholder="John Doe"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={!isValid}
                              className="btn btn-lined"
                            >
                              Sign up and Login
                            </button>
                          </Form>
                        </div>
                      )}
                    />
                  )}
              </div>
            </section>
          </div>
        </div>
        <br />
        <br />
        <br />

        <footer className="footer">
          <div className="container">
            <div className="row">
              <div className="col-md">
                <span>
                  ©<span className="pl-2">2018</span>
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
        <InlineNotification
          defaultMessage="Welcome to Apate"
          triggeredBy={onSuccess(actionTypes.LOGIN_REQUEST)}
        />
        <InlineNotification
          defaultMessage="Incorrect credentials"
          triggeredBy={onFailure(actionTypes.LOGIN_REQUEST)}
          notifType="danger"
        />
      </div>
    );
  }
}

export default connect(
  Root.mapStateToProps,
  Root.mapDispatchToProps
)(Root);
