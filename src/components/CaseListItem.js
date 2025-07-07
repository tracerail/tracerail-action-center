import React from "react";
import PropTypes from "prop-types";

/**
 * Renders a single item in the CaseList.
 * Displays summary information about a case, allowing for quick identification.
 */
const CaseListItem = ({ caseItem }) => {
  const { id, title, status, assignee, lastUpdate } = caseItem;

  return (
    <div className="case-list-item">
      <div className="case-info">
        <div className="case-title">{title}</div>
        <div className="case-metadata">
          <span className="case-status">{status}</span>
          <span className="case-assignee"> &middot; {assignee}</span>
        </div>
      </div>
      <div className="case-last-update">{lastUpdate}</div>
    </div>
  );
};

CaseListItem.propTypes = {
  /**
   * The case object containing details to display in the list item.
   */
  caseItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    assignee: PropTypes.string.isRequired,
    lastUpdate: PropTypes.string.isRequired,
  }).isRequired,
};

export default CaseListItem;
