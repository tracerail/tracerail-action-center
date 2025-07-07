import React from "react";
import "./styles/base.css";
import "./styles/themes/theme-natural-focus.css";
import ActionCenterLayout from "./components/ActionCenterLayout";

/**
 * The root component of the entire React application.
 *
 * This component imports the base structural styles and a specific theme.
 * To change the theme, you can switch the imported CSS file.
 *
 * Available themes:
 * - "./styles/themes/theme-natural-focus.css" (Default)
 * - "./styles/themes/theme-enterprise-blue.css"
 * - "./styles/themes/theme-developer-dark.css"
 */
function App() {
  return (
    <div className="App">
      <ActionCenterLayout />
    </div>
  );
}

export default App;
