import PropTypes from "prop-types";
import { Component } from "react";

export class State extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    render: PropTypes.func.isRequired,
    initial: PropTypes.object.isRequired
  };

  static defaultProps = {
    onChange: _ => {}
  };

  state = { ...this.props.initial };

  _setState = (updater, cb = _ => _) =>
    this.setState(updater, () => {
      this.props.onChange(this.state);
      cb();
    });

  render() {
    return this.props.render(this.state, this._setState);
  }
}
