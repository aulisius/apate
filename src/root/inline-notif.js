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
      messageType = ""
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
          {triggerAction.defaultMessage || defaultMessage}
          <button
            type="button"
            class="close"
            onClick={onHide}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
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
