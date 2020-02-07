import React from "react";

const sideBar = props => {
  return (
    <nav id="sidebar">
      <div className="sidebar-header">
        <h3>Employees</h3>
      </div>
      <ul className="list-unstyled components">{props.children}</ul>
    </nav>
  );
};

export default sideBar;
