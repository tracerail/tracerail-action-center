import React from "react";
import CaseListItem from "./CaseListItem";

/**
 * Renders a list of cases. This component makes up the leftmost pane of the UI,
 * allowing Agents to see and select from their queue of work.
 */
const CaseList = () => {
  // Placeholder data representing a list of cases.
  // In a real application, this would be fetched from an API.
  const cases = [
    {
      id: "ER-2024-123",
      title: "Expense Report: Office Supplies",
      status: "Pending Manager Approval",
      assignee: "Jane Smith",
      lastUpdate: "2h ago",
    },
    {
      id: "IT-2024-456",
      title: "New Laptop Request for J. Doe",
      status: "Pending Agent Approval",
      assignee: "IT Support",
      lastUpdate: "1d ago",
    },
    {
      id: "CUST-2024-789",
      title: "Customer Inquiry: Billing Question",
      status: "Open",
      assignee: "Billing Team",
      lastUpdate: "5m ago",
    },
  ];

  return (
    <div className="case-list">
      {cases.map((caseItem) => (
        <CaseListItem key={caseItem.id} caseItem={caseItem} />
      ))}
    </div>
  );
};

export default CaseList;
