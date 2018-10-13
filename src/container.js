import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";

import Home from "./home/index";

export default class AppContainer extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  shouldComponentUpdate = () => false;

  render() {
    const { store } = this.props;

    return (
      <Provider store={store}>
        <Home />
      </Provider>
    );
  }
}
