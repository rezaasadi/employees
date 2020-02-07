import React from "react";

const addButton = props => {
  return (
    <a
      href="#add"
      className="btn btn-success"
      onClick={props.onClick}
    >
      <i className="material-icons">&#xE147;</i>
      <span>{props.title}</span>
    </a>
  );
};

export default addButton;
