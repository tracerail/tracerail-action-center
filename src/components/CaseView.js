import React, { useState, useEffect } from "react";
import Message from "./Message";
import InteractionPresenter from "./interactions/InteractionPresenter";
import CaseDetailsPanel from "./CaseDetailsPanel";
import { getCaseById } from "../api/cases";

/**
 * Renders the main view for a single case, orchestrating the three-pane layout.
 * This component is now responsible for fetching its own data from the API
 * service layer and managing loading/error states.
 */
const CaseView = () => {
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the useEffect hook to fetch data when the component mounts.
  useEffect(() => {
    // We are hardcoding a caseId for now. In a real application, this
    // would likely come from the URL (e.g., via React Router).
    const caseId = "ER-2024-08-124";

    getCaseById(caseId)
      .then((data) => {
        setCaseData(data);
      })
      .catch((err) => {
        console.error("Failed to fetch case data:", err);
        setError("Failed to load case data. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  // Render a loading state while the data is being fetched.
  if (isLoading) {
    return (
      <div className="case-view-message">
        <p>Loading case...</p>
      </div>
    );
  }

  // Render an error state if the fetch failed.
  if (error) {
    return (
      <div className="case-view-message error">
        <p>{error}</p>
      </div>
    );
  }

  // Render the main view once data is successfully loaded.
  return (
    <div className="case-view">
      {/* Center Pane: Activity Stream */}
      <div className="activity-stream-container">
        <div className="activity-stream-header">
          <h2>{caseData.caseDetails.caseTitle}</h2>
        </div>
        <div className="activity-stream">
          {caseData.activityStream.map((item) => (
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
        <InteractionPresenter
          caseId={caseData.caseDetails.caseId}
          interaction={caseData.activeInteraction}
        />
      </div>

      {/* Right Pane: Case Details */}
      <CaseDetailsPanel caseDetails={caseData.caseDetails} />
    </div>
  );
};

export default CaseView;
