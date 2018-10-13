import React from "react";
import { Formik, Form, Field } from "formik";

export class Claim extends React.Component {
  render() {
    return (
      <Formik
        initialValues={{
          motion: "none",
          claimContent: ""
        }}
        render={({ values }) => {
          return (
            <Form>
              <div className="custom-control custom-radio custom-control-inline">
                <Field
                  type="radio"
                  id="motion"
                  name="motion"
                  value="lie"
                  className="custom-control-input"
                />
                <label className="custom-control-label" htmlFor="motion">
                  Lie
                </label>
              </div>
              <div className="custom-control custom-radio custom-control-inline">
                <Field
                  type="radio"
                  id="lie"
                  name="motion"
                  value="truth"
                  className="custom-control-input"
                />
                <label className="custom-control-label" htmlFor="lie">
                  Truth
                </label>
              </div>
              <div className="">
                <Field type="text" component="textarea" />
              </div>
            </Form>
          );
        }}
      />
    );
  }
}
