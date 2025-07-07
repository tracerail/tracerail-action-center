import React from 'react';

const FilterTabs = () => {
  return (
    <div className="filter-tabs">
      <button className="active">All</button>
      <button>Open</button>
      <button>Snoozed</button>
      <button>Closed</button>
    </div>
  );
};

export default FilterTabs;
