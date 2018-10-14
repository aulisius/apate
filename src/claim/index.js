import React from "react";
import { Formik, Form, Field } from "formik";
import api from "api";
import { colors } from "../color";

export class Claim extends React.Component {
  render() {
    return (
      <Formik
        initialValues={{
          ...this.props.caption,
          url: `https://www.youtube.com/watch?v=${this.props.videoId}`,
          motion: "none",
          claimComment: "",
          claimCreatorUserName: "t@g.com"
        }}
        onSubmit={async values => {
          await api.postBody("/api/claim", values);
          this.props.closeClaim(true);
        }}
        render={({ values, resetForm }) => {
          return (
            <Form>
              <div className="container">
                <div className="row">
                  <div className="col pr-0">
                    <div className="switch-field">
                      <div className="switch-title">This is a</div>
                      <Field
                        component="select"
                        name="motion"
                        required
                        className="custom-select"
                        style={colors[values.motion]}
                      >
                        <option value="" selected>
                          Describe this
                        </option>
                        <option value="truth">Truth</option>
                        <option value="lie">Lie</option>
                        <option value="hate_speech">Hate Speech</option>
                        <option value="exaggerated_promise">
                          Exaggerated Promise
                        </option>
                      </Field>
                    </div>
                  </div>
                  <div className="col p-0 form-group">
                    <Field
                      type="text"
                      required
                      name="claimComment"
                      className="form-control"
                      component="textarea"
                    />
                  </div>
                </div>
                <div className="row">
                  <div
                    class="btn-group col-md-6 offset-md-3"
                    role="group"
                    aria-label="Claim actions"
                  >
                    <button
                      type="button"
                      onClick={_ => {
                        resetForm();
                        this.props.closeClaim();
                      }}
                      class="btn btn-outline-danger"
                    >
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-outline-primary">
                      Add Claim
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}
