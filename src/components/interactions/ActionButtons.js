import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a set of action buttons based on the API contract.
 * Allows users to make a simple, single-choice decision.
 */
const ActionButtons = ({ interactionId, prompt, payload, submitUrl }) => {
  const { actions } = payload;

  const handleSubmit = async (actionValue) => {
    const responseBody = {
      interactionId,
      response: {
        action: actionValue,
      },
    };

    console.log('Submitting to:', submitUrl);
    console.log('Submission Body:', JSON.stringify(responseBody, null, 2));

    // In a real implementation, you would use fetch() or a library like Axios
    // to make a POST request to the `submitUrl`.
    //
    // try {
    //   const response = await fetch(submitUrl, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       // Include authorization headers as needed
    //     },
    //     body: JSON.stringify(responseBody),
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error(`API request failed with status ${response.status}`);
    //   }
    //
    //   // Handle successful submission, e.g., by notifying the parent
    //   // component to refresh the conversation history.
    //   console.log('Submission successful!');
    //
    // } catch (error) {
    //   console.error('Failed to submit action:', error);
    //   // Handle submission error, e.g., by displaying an error message to the user.
    // }
  };

  const getButtonClassName = (style) => {
    switch (style) {
      case 'primary':
        return 'button button-primary';
      case 'danger':
        return 'button button-danger';
      default:
        return 'button';
    }
  };

  return (
    <div className="interaction-container action-buttons">
      {prompt && <p className="interaction-prompt">{prompt}</p>}
      <div className="button-group">
        {actions.map((action) => (
          <button
            key={action.value}
            className={getButtonClassName(action.style)}
            onClick={() => handleSubmit(action.value)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

ActionButtons.propTypes = {
  /**
   * The unique identifier for this interaction instance.
   */
  interactionId: PropTypes.string.isRequired,
  /**
   * The user-facing prompt or question.
   */
  prompt: PropTypes.string,
  /**
   * The payload object from the API containing the button definitions.
   */
  payload: PropTypes.shape({
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        style: PropTypes.oneOf(['primary', 'secondary', 'danger']),
      })
    ).isRequired,
  }).isRequired,
  /**
   * The URL where the response should be submitted.
   */
  submitUrl: PropTypes.string.isRequired,
};

export default ActionButtons;
