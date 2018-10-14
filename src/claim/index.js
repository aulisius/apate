import React from "react";
import { Formik, Form, Field } from "formik";
import api from "api";

export class Claim extends React.Component {
  render() {
    return (
      <Formik
        initialValues={{
          ...this.props.caption,
          url: `https://www.youtube.com/watch?v=${this.props.videoId}`,
          motion: "uncertain",
          claimComment: "",
          claimCreatorUserName: this.props.userName
        }}
        onSubmit={async values => {
          await api.postBody("/api/claim", values);
          this.props.closeClaim(true);
        }}
        render={({ values, resetForm }) => {
          return (
            <Form>
              <div className="form-group">
                <Field
                  component="select"
                  name="motion"
                  className="form-control"
                  id="exampleFormControlSelect1"
                >
                  <option value="" selected>
                    Select a claim
                  </option>
                  <option value="truth">Truth</option>
                  <option value="lie">Lie</option>
                  <option value="hate_speech">Hate Speech</option>
                  <option value="exaggerated_promise">Exaggeration</option>
                </Field>
              </div>
              <div className="form-group">
                <Field
                  type="text"
                  required
                  name="claimComment"
                  placeholder="Enter evidences to back your claim"
                  className="form-control"
                  component="textarea"
                />
              </div>
              <div className="row">
                <div
                  class="btn-group col-md-6"
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
            </Form>
          );
        }}
      />
    );
  }
}
