import React, { useState } from "react";
import PropTypes from "prop-types";
import { submitDecision } from "../../api/cases";

/**
 * Renders a set of action buttons based on the API contract.
 * Allows users to make a simple, single-choice decision.
 */
const ActionButtons = ({ caseId, prompt, payload }) => {
  const { actions } = payload;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (decision) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await submitDecision(caseId, decision);
      // In a real application, you might want to trigger a refresh
      // of the case data here instead of reloading the page.
      window.location.reload();
    } catch (err) {
      console.error("Failed to submit decision:", err);
      setError("Failed to submit decision. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getButtonClassName = (style) => {
    switch (style) {
      case "primary":
        return "button button-primary";
      case "danger":
        return "button button-danger";
      default:
        return "button";
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : action.label}
          </button>
        ))}
      </div>
      {error && <p className="interaction-error">{error}</p>}
    </div>
  );
};

ActionButtons.propTypes = {
  /**
   * The unique identifier for the case, used for submitting the decision.
   */
  caseId: PropTypes.string.isRequired,
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
        style: PropTypes.oneOf(["primary", "secondary", "danger"]),
      }),
    ).isRequired,
  }).isRequired,
};

export default ActionButtons;
