import React from "react";

const editButton = props => {
  return (
    <a href="#edit" className="edit" onClick={props.clicked}>
      <i className="material-icons" data-toggle="tooltip" title="Edit">
        &#xE254;
      </i>
    </a>
  );
};

export default editButton;
