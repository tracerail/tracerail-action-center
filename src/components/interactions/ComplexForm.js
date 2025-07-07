import React from 'react';
import PropTypes from 'prop-types';

// This component relies on the `react-jsonschema-form` library.
// It needs to be added as a project dependency.
// Run: npm install @rjsf/core @rjsf/validator-ajv8
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

/**
 * Renders a complex, dynamic form based on a JSON Schema provided by the API.
 * This is used for sophisticated data entry tasks.
 */
const ComplexForm = ({ interactionId, prompt, payload, submitUrl }) => {
  const { schema, uiSchema } = payload;

  const handleSubmit = async ({ formData }) => {
    const responseBody = {
      interactionId,
      response: formData,
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
    //   // Handle successful submission
    //   console.log('Submission successful!');
    //
    // } catch (error) {
    //   console.error('Failed to submit form:', error);
    //   // Handle submission error
    // }
  };

  return (
    <div className="interaction-container complex-form">
      {prompt && <p className="interaction-prompt">{prompt}</p>}
      <div className="form-layout">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          onSubmit={handleSubmit}
          showErrorList={true}
          // The children prop allows for custom layout, including the submit button.
        >
          <div>
            <button type="submit" className="button button-primary">Submit</button>
          </div>
        </Form>
      </div>
    </div>
  );
};

ComplexForm.propTypes = {
  /**
   * The unique identifier for this interaction instance.
   */
  interactionId: PropTypes.string.isRequired,
  /**
   * The user-facing prompt or question.
   */
  prompt: PropTypes.string,
  /**
   * The payload object from the API containing the JSON Schema.
   */
  payload: PropTypes.shape({
    /**
     * A valid JSON Schema object that defines the form's data model and validation.
     */
    schema: PropTypes.object.isRequired,
    /**
     * An optional schema to provide UI hints to the form renderer.
     */
    uiSchema: PropTypes.object,
  }).isRequired,
  /**
   * The URL where the response should be submitted.
   */
  submitUrl: PropTypes.string.isRequired,
};

export default ComplexForm;
