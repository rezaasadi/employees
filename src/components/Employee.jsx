import React from "react";

import EditButton from "./UI/Buttons/EditButton";
import DeleteButtonSingle from "./UI/Buttons/DeleteButtonSingle";

const employee = props => {
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
      <td>{props.emp.groups.map(gr => `${gr}`).join(", ")}</td>
      <td>
        <EditButton clicked={props.onSave} />
        <DeleteButtonSingle clicked={props.onDelete} />
      </td>
    </tr>
  );
};

export default employee;
