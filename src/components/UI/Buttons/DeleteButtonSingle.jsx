import React from "react";

const deleteButtonSingle = props => {
  return (
    <a href="#delete" className="delete" onClick={props.clicked}>
      <i className="material-icons" data-toggle="tooltip" title="Delete">
        &#xE872;
      </i>
    </a>
  );
};

export default deleteButtonSingle;
