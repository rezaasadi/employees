import React from "react";

import EditButton from "./UI/Buttons/EditButton";
import DeleteButtonSingle from "./UI/Buttons/DeleteButtonSingle";

const group = props => {
  return (
    <tr>
      <td>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            id={props.group.id}
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
          <label htmlFor={props.group.id}></label>
        </span>
      </td>
      <td>
        <button type="button" className="btn btn-link" onClick={props.onClick}>
          {props.group.name}
        </button>
      </td>
      <td>
        <button type="button" className="btn btn-link" onClick={props.onClick}>
          [ {props.group.memberCounts} ]
        </button>
      </td>
      <td>
        <EditButton clicked={props.onSave} />
        <DeleteButtonSingle clicked={props.onDelete} />
      </td>
    </tr>
  );
};

export default group;
