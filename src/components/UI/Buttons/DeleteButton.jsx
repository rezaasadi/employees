import React from "react";

const deleteButton = props => {
  return (
    <a
      href="#delete"
      className={props.disabled ? "btn btn-danger disabled" : "btn btn-danger"}
      onClick={props.onClick}
    >
      <i className="material-icons">&#xE15C;</i> <span>{props.title}</span>
    </a>
  );
};

export default deleteButton;
