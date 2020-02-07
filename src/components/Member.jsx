import React from "react";

import DeleteButtonSingle from "./UI/Buttons/DeleteButtonSingle";

const member = props => {
  return (
    <tr>
      <td>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            id={props.emp.id}
            name="options[]"
            value="1"
            checked={props.checked}
            onChange={e => {
              props.handleChecked({
                id: e.target.id,
                value: e.target.checked
              });
            }}
          ></input>
          <label htmlFor={props.emp.id}></label>
        </span>
      </td>
      <td>{props.emp.name}</td>
      <td>{props.emp.email}</td>
      <td>{props.emp.address}</td>
      <td>{props.emp.phone}</td>
      {props.action ? (
        <td>
          <DeleteButtonSingle clicked={props.onRemove} />
        </td>
      ) : (
        ""
      )}
    </tr>
  );
};

export default member;
