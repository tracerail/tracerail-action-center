import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders the right-hand panel in the CaseView, displaying the core,
 * structured metadata of a case. This gives the Agent at-a-glance context.
 */
const CaseDetailsPanel = ({ caseDetails }) => {
  if (!caseDetails) {
    return (
      <div className="case-details-panel">
        <p>No case selected.</p>
      </div>
    );
  }

  const {
    caseId,
    status,
    assignee,
    submitter,
    createdAt,
    updatedAt,
    caseData = {}, // Default to an empty object to prevent errors
  } = caseDetails;

  const DetailItem = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="detail-item">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
      </div>
    );
  };

  const AiDetailItem = ({ label, value, risk }) => {
    if (!value) return null;
    const riskClass = risk ? `risk-${risk.toLowerCase()}` : '';
    return (
      <div className="detail-item">
        <span className="detail-label">{label}</span>
        <span className={`detail-value ${riskClass}`}>{value}</span>
      </div>
    );
  };


  return (
    <div className="case-details-panel">
      <h3 className="panel-header">Case Details</h3>
      <div className="details-group">
        <DetailItem label="Case ID" value={caseId} />
        <DetailItem label="Status" value={status} />
        <DetailItem label="Assignee" value={assignee?.name || 'Unassigned'} />
        <DetailItem label="Submitter" value={submitter?.name} />
        <DetailItem label="Created" value={new Date(createdAt).toLocaleString()} />
        <DetailItem label="Last Updated" value={new Date(updatedAt).toLocaleString()} />
      </div>

      {/* Render core case data if it exists */}
      {(caseData.amount || caseData.category) && (
        <div className="details-group">
          <h4 className="group-header">Expense Info</h4>
          <DetailItem label="Amount" value={caseData.amount ? `${caseData.amount} ${caseData.currency}`: null} />
          <DetailItem label="Category" value={caseData.category} />
        </div>
      )}


      {/* Render AI analysis if it exists */}
      {(caseData.ai_summary || caseData.ai_risk_score) && (
        <div className="details-group ai-details">
            <h4 className="group-header">AI Analysis</h4>
            <AiDetailItem label="Summary" value={caseData.ai_summary} />
            <AiDetailItem label="Policy Check" value={caseData.ai_policy_check} />
            <AiDetailItem label="Risk Score" value={caseData.ai_risk_score} risk={caseData.ai_risk_score} />
        </div>
      )}
    </div>
  );
};

CaseDetailsPanel.propTypes = {
  /**
   * An object containing all the metadata for the currently selected case.
   */
  caseDetails: PropTypes.shape({
    caseId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
        name: PropTypes.string,
    }),
    submitter: PropTypes.shape({
        name: PropTypes.string,
    }),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    caseData: PropTypes.object,
  }),
};

export default CaseDetailsPanel;
