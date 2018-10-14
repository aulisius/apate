import React, { Component, Fragment } from "react";
import { Formik, Form, Field } from "formik";
import { connect } from "react-redux";
import { actions } from "./ducks";
import api from "api";
import "./styles.scss";
// import { InlineNotification } from "./inline-notif";
// import { onSuccess, onFailure } from "@faizaanceg/redux-side-effect";

import "./styles.scss";

class Root extends Component {
  static mapDispatchToProps = actions;

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

  render() {
    return (
      <Fragment>
        <section>
          <div className="hero text-center">
            <h1 className="hero-title">APATE</h1>
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

            {this.props.loggedIn && (
              <Formik
                initialValues={{
                  videoUrl: ""
                }}
                onSubmit={async values => {
                  // this.props.postVideo(values.videoUrl)
                  let videoLink = new URL(values.videoUrl);
                  let videoId = null;
                  if (videoLink.hostname === "youtu.be") {
                    videoId = videoLink.pathname.substr(1);
                  } else {
                    videoId = videoLink.searchParams.get("v");
                  }
                  try {
                    await api.postBody("/api/video", {
                      videoLink: values.videoUrl,
                      userName: "t@g.com"
                    });
                    this.props.navigate(`/watch/${videoId}`);
                  } catch (error) {}
                }}
                validate={values => {
                  let videoLink = new URL(values.videoUrl);
                  try {
                    let validHosts = ["www.youtube.com", "youtu.be"];
                    let isHostValid = validHosts.includes(videoLink.hostname);
                    return isHostValid
                      ? {}
                      : {
                          videoUrl: "Invalid URL"
                        };
                  } catch (error) {
                    return {
                      videoUrl: "Invalid URL"
                    };
                  }
                }}
                render={({ errors }) => {
                  return (
                    <div className="post-video">
                      <div className="container">
                        <div className="row">
                          <div class="col-md-6 offset-md-3">
                            <div class="search-box">
                              <Form class="search-form">
                                <Field
                                  className="form-control"
                                  type="url"
                                  id="url"
                                  name="videoUrl"
                                  placeholder="Enter YouTube URL"
                                />
                                <button
                                  type="submit"
                                  className="btn btn-link search-btn"
                                >
                                  <i className="fab fa-youtube" />
                                </button>
                              </Form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </section>
        {/* <InlineNotification
          defaultMessage="Welcome to Apate"
          triggeredBy={onSuccess(actionTypes.LOGIN_REQUEST)}
        />
        <InlineNotification
          defaultMessage="Incorrect credentials"
          triggeredBy={onFailure(actionTypes.LOGIN_REQUEST)}
          notifType="danger"
        /> */}
      </Fragment>
    );
  }
}

export default connect(
  null,
  Root.mapDispatchToProps
)(Root);
