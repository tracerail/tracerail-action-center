import React from "react";
import SearchBar from "./SearchBar";
import FilterTabs from "./FilterTabs";
import CaseList from "./CaseList";
import CaseView from "./CaseView";

/**
 * The main layout component for the entire Action Center application.
 * It orchestrates the primary navigation and view panes.
 */
const ActionCenterLayout = () => {
  return (
    // The top-level container for the application.
    // The CSS class "action-center-app" will replace the old "inbox-app".
    <div className="action-center-app">
      {/* The left-hand sidebar containing navigation and the list of cases */}
      <div className="action-center-sidebar">
        <SearchBar />
        <FilterTabs />
        <CaseList />
      </div>

      {/* The main content area where a single case is displayed and acted upon */}
      <div className="action-center-main-content">
        <CaseView />
      </div>
    </div>
  );
};

export default ActionCenterLayout;
