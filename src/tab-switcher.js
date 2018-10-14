import PropTypes from "prop-types";
import { Component } from "react";
export const applyAll = (...fns) => (...args) => fns.forEach(fn => fn(...args));

export default class TabSwitcher extends Component {
  static propTypes = {
    initialValue: PropTypes.any.isRequired,
    onSwitch: PropTypes.func,
    render: PropTypes.func.isRequired
  };

  static defaultProps = {
    onSwitch: _ => {}
  };

  state = {
    selectedTab: this.props.initialValue
  };

  setTab = selectedTab => this.setState({ selectedTab });

  notifySwitch = applyAll(this.setTab, this.props.onSwitch);

  render() {
    return this.props.render({
      ...this.state,
      onTabSwitch: this.notifySwitch
    });
  }
}
