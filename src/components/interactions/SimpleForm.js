import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a simple form with a dynamic set of fields, as defined by the API contract.
 * Used for collecting a small amount of structured data from the user.
 */
const SimpleForm = ({ interactionId, prompt, payload, submitUrl }) => {
  const [formData, setFormData] = useState({});

  // Initialize form state when the component mounts or the payload changes.
  // This ensures the form is correctly populated with default values.
  useEffect(() => {
    const initialData = {};
    payload.fields.forEach(field => {
      // Use the provided defaultValue, or fall back to an empty string.
      initialData[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
      // Explicitly set a default for boolean fields if none is provided.
      if (field.fieldType === 'boolean' && field.defaultValue === undefined) {
        initialData[field.name] = false;
      }
    });
    setFormData(initialData);
  }, [payload.fields]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox inputs differently from other input types.
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prevData => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    //   // Handle successful submission, e.g., by notifying the parent
    //   // component to refresh the conversation history.
    //   console.log('Submission successful!');
    //
    // } catch (error) {
    //   console.error('Failed to submit form:', error);
    //   // Handle submission error, e.g., by displaying an error message.
    // }
  };

  /**
   * Renders the correct HTML input element based on the fieldType from the API.
   */
  const renderField = (field) => {
    const { name, label, fieldType, required } = field;
    const value = formData[name];

    switch (fieldType) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            required={required}
            rows={4}
          />
        );
      case 'boolean':
        return (
          <div className="checkbox-wrapper">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={!!value} // Ensure value is a boolean for the checkbox
              onChange={handleChange}
            />
          </div>
        );
      case 'date':
      case 'number':
      case 'text':
      default:
        return (
          <input
            id={name}
            name={name}
            type={fieldType}
            value={value || ''}
            onChange={handleChange}
            required={required}
          />
        );
    }
  };

  return (
    <div className="interaction-container simple-form">
      {prompt && <p className="interaction-prompt">{prompt}</p>}
      <form onSubmit={handleSubmit} className="form-layout">
        {payload.fields.map(field => (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required-asterisk"> *</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
        <button type="submit" className="button button-primary">Submit</button>
      </form>
    </div>
  );
};

SimpleForm.propTypes = {
  interactionId: PropTypes.string.isRequired,
  prompt: PropTypes.string,
  payload: PropTypes.shape({
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        fieldType: PropTypes.oneOf(['text', 'textarea', 'number', 'date', 'boolean']).isRequired,
        required: PropTypes.bool,
        defaultValue: PropTypes.any,
      })
    ).isRequired,
  }).isRequired,
  submitUrl: PropTypes.string.isRequired,
};

export default SimpleForm;
