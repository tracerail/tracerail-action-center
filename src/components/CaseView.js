import React from "react";
import Message from "./Message";
import InteractionPresenter from "./interactions/InteractionPresenter";
import CaseDetailsPanel from "./CaseDetailsPanel";

/**
 * Renders the main view for a single case, orchestrating the three-pane layout.
 * This component is the core of the Agent's workspace.
 */
const CaseView = () => {
  // --- MOCK DATA ---
  // This data is taken directly from our process flow document to simulate
  // Path C: The Human Agent Review Flow for an expense report.

  // 1. Details for the right-hand panel
  const caseDetails = {
    caseId: "ER-2024-08-124",
    caseTitle: "Expense Report from John Doe for $750.00",
    status: "Pending Agent Approval",
    assignee: { name: "Jane Smith", email: "jane.smith@example.com" },
    submitter: { name: "John Doe", email: "john.doe@example.com" },
    createdAt: "2024-08-21T10:30:00Z",
    updatedAt: "2024-08-21T10:35:00Z",
    caseData: {
      amount: 750.0,
      currency: "USD",
      category: "Travel",
      ai_summary: "This is a request for a flight to the annual conference.",
      ai_policy_check:
        "Warning: Expense exceeds the $500 standard limit for this role.",
      ai_risk_score: "Medium",
    },
  };

  // 2. The history of events for the center activity stream
  const activityStream = [
    {
      id: 1,
      type: "system_event",
      sender: "System",
      text: "Case created and assigned to AI Agent for triage.",
      timestamp: "2024-08-21T10:30:00Z",
    },
    {
      id: 2,
      type: "ai_analysis",
      sender: "AI Agent",
      text: "Analysis complete. Risk Score: Medium. Assigning to manager for review.",
      timestamp: "2024-08-21T10:35:00Z",
    },
  ];

  // 3. The currently active task for the Agent
  const activeInteraction = {
    interactionId: "approve_request_ER-2024-08-124",
    interactionType: "action_buttons",
    prompt:
      "Please review the expense report. The amount is above the standard policy limit.",
    payload: {
      actions: [
        { label: "Approve", value: "approved", style: "primary" },
        { label: "Reject", value: "rejected", style: "danger" },
      ],
    },
    submitUrl: "https://api.tracerail.com/v1/responses/ER-2024-08-124",
  };

  // --- COMPONENT RENDER ---
  return (
    <div className="case-view">
      {/* Center Pane: Activity Stream */}
      <div className="activity-stream-container">
        <div className="activity-stream-header">
          <h2>{caseDetails.caseTitle}</h2>
        </div>
        <div className="activity-stream">
          {activityStream.map((item) => (
            <Message
              key={item.id}
              message={{
                id: item.id,
                sender: item.sender,
                text: item.text,
              }}
            />
          ))}
        </div>
        <InteractionPresenter interaction={activeInteraction} />
      </div>

      {/* Right Pane: Case Details */}
      <CaseDetailsPanel caseDetails={caseDetails} />
    </div>
  );
};

export default CaseView;
