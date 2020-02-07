import React, { Component } from "react";
import axios from "axios";

import Employee from "./Employee";
import ListHeader from "./UI/ListHeader";
import AddButton from "./UI/Buttons/AddButton";
import DeleteButton from "./UI/Buttons/DeleteButton";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";

let __DELETE_TYPE = false,
  __ID;

class Employees extends Component {
  state = {
    employeeList: {},
    groupList: {},
    selectedRecord: [],
    employeeModalshow: false,
    employeeModalType: 0,
    name: "",
    email: "",
    address: "",
    phone: "",
    groups: [],
    deleteModalshow: false
  };

  componentDidMount() {
    axios.get("/groups").then(res => {
      const groups = {};
      res.data.map(
        gr => (groups[gr.id] = { name: gr.name, members: gr.members })
      );
      this.setState({ groupList: groups });
      axios.get("/employees").then(res => {
        const employees = {};
        res.data.map(
          emp =>
            (employees[emp.id] = {
              name: emp.name,
              email: emp.email,
              address: emp.address,
              phone: emp.phone,
              groups: emp.groups
            })
        );
        this.setState({ employeeList: employees });
      });
    });
  }

  addEmployeeHandler = () => {
    let eList = { ...this.state.employeeList };
    const newId = Object.keys(eList)[Object.keys(eList).length - 1] * 1 + 1;
    const newEmployee = {
      id: newId,
      name: this.state.name,
      email: this.state.email,
      address: this.state.address,
      phone: this.state.phone,
      groups: []
    };

    axios.post("/employees", newEmployee).then(res => {
      if (res.status === 201) {
        delete newEmployee.id;
        eList[newId] = newEmployee;
        this.setState({ employeeList: eList });
        this.resetTempData();
        this.setState({ employeeModalshow: false });
      }
    });
  };

  //Remove employee from subscribed groups and delete employee
  removeEmployeeFromGroups = (id, employeeList) => {
    return new Promise(resolve => {
      if (employeeList[id].groups.length === 0) resolve(true);
      employeeList[id].groups.forEach(grId => {
        let group = { ...this.state.groupList }[grId];
        group.id = grId;
        group.members.splice(group.members.indexOf(parseInt(id)), 1);
        axios.put("/groups/" + grId, group).then(res => {
          if (
            employeeList[id].groups.indexOf(grId) ===
            employeeList[id].groups.length - 1
          )
            resolve(true);
        });
      });
    });
  };

  //Remove all selected employees and their subscribes
  deleteSelectedEmployees = (recordList, employeeList) => {
    return new Promise(resolve => {
      recordList.map(empId =>
        this.removeEmployeeFromGroups(empId, employeeList).then(res =>
          axios.delete("/employees/" + empId).then(res => {
            delete employeeList[empId];
            this.setState({ employeeList });
            if (recordList.indexOf(empId) === recordList.length - 1)
              resolve(true);
          })
        )
      );
    });
  };

  submitDeleteEmployee = async () => {
    let eList = { ...this.state.employeeList };
    if (!__DELETE_TYPE) {
      // Delete one employee at the row
      await this.removeEmployeeFromGroups(__ID, eList);

      await axios.delete("/employees/" + __ID);
      delete eList[__ID];
      if (this.state.selectedRecord.indexOf(__ID) !== -1) {
        let rList = [...this.state.selectedRecord];
        rList.splice(rList.indexOf(__ID), 1);
        this.setState({ selectedRecord: rList });
      }
      this.setState({ employeeList: eList });
      this.closeDeleteModal();
    } else {
      // Delete some of selected employees
      await this.deleteSelectedEmployees(this.state.selectedRecord, eList);
      this.setState({ selectedRecord: [] });
      this.closeDeleteModal();
    }
  };

  submitEditedEmployee = () => {
    let eList = { ...this.state.employeeList };
    const emp = {
      id: __ID,
      name: this.state.name,
      email: this.state.email,
      address: this.state.address,
      phone: this.state.phone,
      groups: this.state.groups
    };
    axios.put("/employees/" + __ID, emp).then(res => {
      if (res.status === 200) {
        delete emp.id;
        eList[__ID] = emp;
        this.setState({ employeeList: eList });
        this.setState({ employeeModalshow: false });
        this.resetTempData();
      }
    });
  };

  selectHandler = target => {
    let rList = [...this.state.selectedRecord];
    if (target.value) rList.push(target.id);
    else rList.splice(rList.indexOf(target.id), 1);
    this.setState({ selectedRecord: rList });
  };

  checkAll = checked => {
    let rList = [];
    if (checked)
      rList = Object.keys({ ...this.state.employeeList }).map(key => key);
    this.setState({ selectedRecord: rList });
  };

  editEmployeeModal = emp => {
    __ID = emp.id;
    this.setState({ name: emp.name });
    this.setState({ email: emp.email });
    this.setState({ address: emp.address });
    this.setState({ phone: emp.phone });
    this.setState({ groups: emp.groups });
    this.setState({ employeeModalType: 1 });
    this.setState({ employeeModalshow: true });
  };

  resetTempData = () => {
    this.setState({ name: "" });
    this.setState({ email: "" });
    this.setState({ address: "" });
    this.setState({ phone: "" });
    this.setState({ groups: [] });
  };

  closeEmployeeModal = () => {
    this.resetTempData();
    this.setState({ employeeModalshow: false });
  };
  newEmployeeModal = () => {
    this.resetTempData();
    this.setState({ employeeModalType: 0 });
    this.setState({ employeeModalshow: true });
  };

  deleteEmployeeModal = id => {
    if (id != null) {
      __ID = id;
      __DELETE_TYPE = false;
    } else __DELETE_TYPE = true;
    this.setState({ deleteModalshow: true });
  };

  closeDeleteModal = () => {
    this.setState({ deleteModalshow: false });
  };

  render() {
    return (
      <>
        <div className="container">
          <div className="table-wrapper">
            <ListHeader title={"Manage Employees"}>
              <AddButton
                title={"Add New Employee"}
                onClick={this.newEmployeeModal}
              />
              <DeleteButton
                title={"Delete"}
                disabled={!this.state.selectedRecord.length}
                onClick={() => this.deleteEmployeeModal(null)}
              />
            </ListHeader>
            <table className="table table-striped table-hover table-body-scrollY">
              <thead>
                <tr>
                  <th>
                    <span className="custom-checkbox">
                      <input
                        type="checkbox"
                        id="selectAll"
                        onChange={e => {
                          this.checkAll(e.target.checked);
                        }}
                      ></input>
                      <label htmlFor="selectAll"></label>
                    </span>
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Groups</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.state.employeeList).map(id => {
                  let employee = { ...this.state.employeeList[id] };
                  employee.id = id;
                  let oEmp = { ...employee };
                  employee.groups = employee.groups.map(
                    gr => this.state.groupList[gr].name
                  );
                  return (
                    <Employee
                      key={id}
                      emp={employee}
                      checked={this.state.selectedRecord.indexOf(id) !== -1}
                      handleChecked={this.selectHandler}
                      onDelete={() => this.deleteEmployeeModal(id)}
                      onSave={() => this.editEmployeeModal(oEmp)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* --------------------------- ADD NEW & EDIT EMPLOYEE MODAL --------------------------- */}
        <Modal
          show={this.state.employeeModalshow}
          onHide={this.closeEmployeeModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.employeeModalType === 0
                ? "Add New Employee"
                : "Edit Employee"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <FormGroup>
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.name}
                  onChange={event =>
                    this.setState({ name: event.target.value })
                  }
                  required
                ></input>
              </FormGroup>
              <FormGroup>
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={this.state.email}
                  onChange={event =>
                    this.setState({ email: event.target.value })
                  }
                  required
                ></input>
              </FormGroup>
              <FormGroup>
                <label>Address</label>
                <textarea
                  className="form-control"
                  value={this.state.address}
                  onChange={event =>
                    this.setState({ address: event.target.value })
                  }
                  required
                ></textarea>
              </FormGroup>
              <FormGroup>
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.phone}
                  onChange={event =>
                    this.setState({ phone: event.target.value })
                  }
                  required
                ></input>
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeEmployeeModal}>
              Cancel
            </Button>
            {this.state.employeeModalType === 0 ? (
              <Button variant="success" onClick={this.addEmployeeHandler}>
                Add
              </Button>
            ) : (
              <Button variant="info" onClick={this.submitEditedEmployee}>
                Save
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* --------------------------- DELETE EMPLOYEE MODAL --------------------------- */}
        <Modal show={this.state.deleteModalshow} onHide={this.closeDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Records</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete these Records?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={this.submitDeleteEmployee}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default Employees;
