import Snitch from "snitch";
import PropTypes from "prop-types";
import React from "react";

export class InlineNotification extends React.Component {
  static propTypes = {
    triggeredBy: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    messageType: PropTypes.string,
    defaultMessage: PropTypes.string,
    hide: PropTypes.func,
    hideAfter: PropTypes.number,
    renderNotification: PropTypes.func,
    showDismiss: PropTypes.bool
  };

  renderNotification = ({ show, onHide }, triggerAction = {}) => {
    const {
      defaultMessage = "",
      hideAfter = 4000,
      messageType = "",
      showDismiss = true
    } = this.props;
    const { notificationType = messageType } = triggerAction;
    if (show) {
      setTimeout(onHide, hideAfter);
    }
    return (
      show && (
        <div
          className={`notification alert alert-${notificationType ||
            "primary"}`}
        >
          {notificationType !== "error" && (
            <span className="notification-tick" />
          )}
          {triggerAction.defaultMessage || defaultMessage}
          {showDismiss && (
            <span className="notification-dismiss" onClick={onHide}>
              x
            </span>
          )}
        </div>
      )
    );
  };

  render() {
    return (
      <Snitch
        id={this.props.defaultMessage}
        opensOn={this.props.triggeredBy}
        updateWhen={action => this.props.triggeredBy.includes(action.type)}
        render={this.renderNotification}
      />
    );
  }
}
