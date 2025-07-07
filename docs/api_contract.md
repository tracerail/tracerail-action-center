# API Contract: Dynamic Human-in-the-Loop Interactions

This document defines the API contract between the Tracerail backend and the `tracerail-action-center` frontend. Its purpose is to specify a clear data structure for dynamically rendering contextual user interactions within a conversation thread.

## 1. Overview

To enable true "human-in-the-loop" functionality, the backend must be able to prompt users for specific actions or data, not just send text messages. The frontend will receive a JSON object describing the required interaction and will render the appropriate UI component (e.g., buttons, a form). When the user completes the action, the frontend will POST the response back to a specified URL.

## 2. The Interaction Object

When a workflow requires user input, the backend will provide a conversation message containing the following `Interaction` JSON object.

| Field             | Type   | Description                                                                                               |
| ----------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `interactionId`   | string | A unique identifier for this specific interaction instance. This ID **must** be sent back with the response. |
| `interactionType` | string | An enum specifying which UI component to render. See `Interaction Models` below.                          |
| `prompt`          | string | A user-facing prompt or question to display above the interaction component (e.g., "Please provide a reason for rejection."). |
| `payload`         | object | A JSON object containing the specific configuration for the given `interactionType`.                     |
| `submitUrl`       | string | The absolute API endpoint where the frontend should POST the user's response.                               |

## 3. Interaction Models

The `interactionType` field determines the structure of the `payload` object and the component to be rendered.

### 3.1. `interactionType: "action_buttons"`

Used for simple, single-choice decisions.

#### Payload Structure

The `payload` is an object containing a single key, `actions`, which is an array of button objects.

**Button Object:**
| Field | Type | Description |
|---|---|---|
| `label` | string | The text displayed on the button (e.g., "Approve"). |
| `value` | string | The value sent to the backend when the button is clicked. |
| `style` | string | (Optional) A hint for UI styling. Values: `primary`, `secondary`, `danger`. Defaults to `secondary`.|

#### Example

```json
{
  "interactionId": "approve_request_123",
  "interactionType": "action_buttons",
  "prompt": "Please review and approve or reject the expense report.",
  "payload": {
    "actions": [
      {
        "label": "Approve",
        "value": "approved",
        "style": "primary"
      },
      {
        "label": "Reject",
        "value": "rejected",
        "style": "danger"
      }
    ]
  },
  "submitUrl": "https://api.tracerail.com/v1/responses/expense_report_abc"
}
```

---

### 3.2. `interactionType: "simple_form"`

Used for collecting a small amount of structured data.

#### Payload Structure

The `payload` is an object containing a single key, `fields`, which is an array of field objects.

**Field Object:**
| Field | Type | Description |
|---|---|---|
| `name` | string | The key for this field in the response object. |
| `label` | string | The user-facing label for the form field. |
| `fieldType` | string | The type of input to render. Values: `text`, `textarea`, `number`, `date`, `boolean`. |
| `required` | boolean| Whether the field must be filled out. |
| `defaultValue`| any | (Optional) A default value for the field. |

#### Example

```json
{
  "interactionId": "rejection_reason_456",
  "interactionType": "simple_form",
  "prompt": "You have rejected the request. Please provide a reason for the rejection.",
  "payload": {
    "fields": [
      {
        "name": "rejection_reason",
        "label": "Reason for Rejection",
        "fieldType": "textarea",
        "required": true
      },
      {
        "name": "notify_submitter",
        "label": "Notify original submitter",
        "fieldType": "boolean",
        "required": true,
        "defaultValue": true
      }
    ]
  },
  "submitUrl": "https://api.tracerail.com/v1/responses/expense_report_abc"
}
```

---

### 3.3. `interactionType: "complex_form"`

Used for complex data entry tasks. The form is defined by a [JSON Schema](https://json-schema.org/).

#### Payload Structure

The `payload` contains a `schema` object, which is a valid JSON Schema. It can optionally include a `uiSchema` for providing UI hints.

**Payload Object:**
| Field | Type | Description |
|---|---|---|
| `schema` | object | A valid JSON Schema object defining the data model and validation. |
| `uiSchema`| object | (Optional) A schema providing UI hints, compatible with libraries like `react-jsonschema-form`. |

#### Example

```json
{
  "interactionId": "correct_address_789",
  "interactionType": "complex_form",
  "prompt": "The automated address validation failed. Please review and correct the customer's shipping address.",
  "payload": {
    "schema": {
      "title": "Shipping Address",
      "type": "object",
      "required": ["street_address", "city", "zip_code"],
      "properties": {
        "street_address": {
          "type": "string",
          "title": "Street Address"
        },
        "city": {
          "type": "string",
          "title": "City"
        },
        "state": {
          "type": "string",
          "title": "State"
        },
        "zip_code": {
          "type": "string",
          "title": "Zip Code",
          "pattern": "^[0-9]{5}(-[0-9]{4})?$"
        }
      }
    }
  },
  "submitUrl": "https://api.tracerail.com/v1/responses/customer_order_xyz"
}
```

---

## 4. Response Submission Format

The frontend must `POST` a JSON object to the `submitUrl` provided in the `Interaction` object. The body of the `POST` request must have the following structure:

| Field         | Type   | Description                                                                 |
| ------------- | ------ | --------------------------------------------------------------------------- |
| `interactionId` | string | The unique ID from the original `Interaction` object.                         |
| `response`    | object | A JSON object containing the user's submitted data.                         |

The structure of the `response` object depends on the original `interactionType`:

*   **For `action_buttons`**:
    ```json
    { "action": "approved" }
    ```
*   **For `simple_form` and `complex_form`**: An object where keys are the field `name`s and values are the user-submitted data.
    ```json
    {
      "rejection_reason": "The expense report exceeds the budget for this category.",
      "notify_submitter": true
    }
    ```
