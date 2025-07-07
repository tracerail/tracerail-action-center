import React from 'react';
import PropTypes from 'prop-types';

const Message = ({ message }) => {
  const { sender, text } = message;
  const isFromCurrentUser = sender === 'You';

  const messageClass = isFromCurrentUser
    ? 'message message-from-current-user'
    : 'message';

  return (
    <div className={messageClass}>
      <div className="message-sender">{sender}</div>
      <div className="message-text">{text}</div>
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    sender: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

export default Message;
