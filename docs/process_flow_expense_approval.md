# Expense Report Approval - End-to-End Process Flow

This document provides a detailed, step-by-step description of the Expense Report Approval business process. It serves as a single source of truth for development, testing, and the creation of mock data.

## Initial State: Case Creation

An employee submits an expense report via an external system. A new **Case** is created in the Action Center with a `Pending AI Triage` status.

*   **Case Details (Initial Payload):**
    ```json
    {
      "caseId": "ER-2024-08-123",
      "caseTitle": "Expense Report from John Doe for $75.00",
      "status": "Pending AI Triage",
      "submitter": { "name": "John Doe", "email": "john.doe@example.com" },
      "assignee": null,
      "createdAt": "2024-08-21T10:00:00Z",
      "updatedAt": "2024-08-21T10:00:00Z",
      "caseData": {
        "amount": 75.00,
        "currency": "USD",
        "category": "Office Supplies",
        "line_items": [ { "description": "Keyboard", "amount": 75.00 } ]
      },
      "attachments": [ { "fileName": "receipt_keyboard.pdf", "url": "/files/receipt1.pdf" } ]
    }
    ```

## Step 1: AI Triage

The **AI Agent** automatically picks up the Case. It performs the following analysis:
1.  **Data Enrichment:** Parses `receipt_keyboard.pdf` using OCR.
2.  **Policy Check:** Verifies the expense is within company policy.
3.  **Anomaly Detection:** Checks if this spending is normal.
4.  **Risk & Confidence Scoring:** Assigns a risk score and confidence level.

The process now diverges into one of three paths based on the AI Triage outcome.

---

## Path A: AI Auto-Approval Flow (Low Risk)

This is the "happy path" for routine, compliant requests.

*   **Criteria:** AI Triage results in: Risk Score: `Low`, Confidence Score: `> 99%`, Policy Check: `Passed`.
*   **AI Action:** The **AI Agent** autonomously approves the Case.
*   **Final Case State:**
    *   `status` is updated to `Approved`.
    *   `assignee` is updated to `{ "name": "AI Agent", "type": "SYSTEM" }`.
    *   An event is added to the **Activity Stream**: `AI Agent approved this request. Reason: In policy and below auto-approval threshold.`

---

## Path B: AI Auto-Rejection Flow (High-Confidence Violation)

This path handles clear, non-negotiable policy violations.

*   **Criteria:** AI Triage results in: Risk Score: `High`, Confidence Score: `> 99%`, Policy Check: `Failed` (non-negotiable violation).
*   **AI Action:** The **AI Agent** autonomously rejects the Case.
*   **Final Case State:**
    *   `status` is updated to `Rejected`.
    *   `assignee` is updated to `{ "name": "AI Agent", "type": "SYSTEM" }`.
    *   An event is added to the **Activity Stream**: `AI Agent rejected this request. Reason: Expense category 'Alcohol' is not permitted.`

---

## Path C: Human Agent Review Flow

This path is for Cases that are ambiguous, high-value, or require human judgment. The user in this flow, regardless of their job title (e.g., Manager), is acting in the role of an **Agent**.

*   **Criteria:** AI Triage results in: Risk Score: `Medium` or `High`, Confidence Score: `< 99%`, or Anomalies: `Detected`.

### Step C1: Assignment to Agent (Manager)

*   **AI Action:** The **AI Agent** enriches the Case and assigns it to the submitter's manager, who will now act as the **Agent** for this Case.
*   **Case State:**
    *   `status` is updated to `Pending Agent Approval`.
    *   `assignee` is updated to `{ "name": "Jane Smith", "email": "jane.smith@example.com" }`.
    *   `caseData` is enriched with AI findings.

*   **Mock Data for `caseData`:**
    ```json
    "caseData": {
      "amount": 750.00,
      "currency": "USD",
      "category": "Travel",
      "ai_summary": "This is a request for a flight to the annual conference.",
      "ai_policy_check": "Warning: Expense exceeds the $500 standard limit for this role.",
      "ai_risk_score": "Medium"
    }
    ```
*   **Mock Data for `Interaction` object in the Activity Stream:**
    ```json
    {
      "interactionId": "approve_request_ER-2024-08-124",
      "interactionType": "action_buttons",
      "prompt": "Please review the expense report. The amount is above the standard policy limit.",
      "payload": {
        "actions": [
          { "label": "Approve", "value": "approved", "style": "primary" },
          { "label": "Reject", "value": "rejected", "style": "danger" }
        ]
      },
      "submitUrl": "https://api.tracerail.com/v1/responses/ER-2024-08-124"
    }
    ```

### Step C2a: Agent Approves

*   **Human Action:** The **Agent** (Jane Smith) clicks the `Approve` button.
*   **Final Case State:**
    *   `status` is updated to `Approved`.
    *   An event is added to the **Activity Stream**: `Agent 'Jane Smith' approved this request.`

### Step C2b: Agent Rejects

*   **Human Action:** The **Agent** (Jane Smith) clicks the `Reject` button.
*   **System Action:** The system logs the `Reject` action and immediately presents a new interaction prompt to the Agent.
*   **Mock Data for new `Interaction` object:**
    ```json
    {
      "interactionId": "rejection_reason_ER-2024-08-124",
      "interactionType": "simple_form",
      "prompt": "You have rejected the request. Please provide a reason that will be sent to the employee.",
      "payload": {
        "fields": [
          {
            "name": "rejection_reason",
            "label": "Reason for Rejection",
            "fieldType": "textarea",
            "required": true
          }
        ]
      },
      "submitUrl": "https://api.tracerail.com/v1/responses/ER-2024-08-124"
    }
    ```

### Step C3: Agent Provides Rejection Reason

*   **Human Action:** The **Agent** fills out the form and clicks `Submit`.
*   **Final Case State:**
    *   `status` is updated to `Rejected`.
    *   `caseData` is updated with the `rejection_reason`.
    *   An event is added to the **Activity Stream**: `Agent 'Jane Smith' rejected this request. Reason: [Text from form].`
