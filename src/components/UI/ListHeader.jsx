import React from "react";

const listHeader = props => {
  return (
    <div className="table-title">
      <div className="row">
        <div className="col-sm-6">
          <h2>{props.title}</h2>
        </div>
        <div className="col-sm-6">{props.children}</div>
      </div>
    </div>
  );
};

export default listHeader;
