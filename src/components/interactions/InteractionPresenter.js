import React from "react";
import PropTypes from "prop-types";
import ActionButtons from "./ActionButtons";
import SimpleForm from "./SimpleForm";
import ComplexForm from "./ComplexForm";

/**
 * A presenter component that dynamically renders the correct UI component
 * based on the interaction object received from the API.
 */
const InteractionPresenter = ({ caseId, interaction }) => {
  // If there is no interaction object, render nothing.
  // This would be the case for simple text messages or when a conversation is closed.
  if (!interaction) {
    return null;
  }

  const { interactionType, ...props } = interaction;

  switch (interactionType) {
    case "action_buttons":
      return <ActionButtons {...props} caseId={caseId} />;
    case "simple_form":
      return <SimpleForm {...props} caseId={caseId} />;
    case "complex_form":
      return <ComplexForm {...props} caseId={caseId} />;
    default:
      // It's good practice to log a warning for unsupported types
      // to help with debugging during development.
      console.warn(`Unknown interaction type received: ${interactionType}`);
      return (
        <div className="unsupported-interaction">
          <p>An unsupported interaction type was received.</p>
        </div>
      );
  }
};

InteractionPresenter.propTypes = {
  /**
   * The unique identifier for the case, passed down from the parent view.
   */
  caseId: PropTypes.string.isRequired,
  /**
   * The interaction object from the API, conforming to the API contract.
   */
  interaction: PropTypes.shape({
    interactionId: PropTypes.string.isRequired,
    interactionType: PropTypes.oneOf([
      "action_buttons",
      "simple_form",
      "complex_form",
    ]).isRequired,
    prompt: PropTypes.string,
    payload: PropTypes.object.isRequired,
    submitUrl: PropTypes.string.isRequired,
  }),
};

export default InteractionPresenter;
