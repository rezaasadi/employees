import React, { Component } from "react";
import axios from "axios";

import Group from "./Group";
import Member from "./Member";
import ListHeader from "./UI/ListHeader";
import AddButton from "./UI/Buttons/AddButton";
import DeleteButton from "./UI/Buttons/DeleteButton";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import Breadcrumb from "react-bootstrap/Breadcrumb";

let __MEMBER_ID,
  __GROUP_ID,
  __DELETE_TYPE = false,
  __CHECK_ALL = false;

class Groups extends Component {
  state = {
    groupList: {},
    employeeList: {},
    selectedRecord: [],
    groupModalshow: false,
    groupModalType: 0,
    name: "",
    members: [],
    deleteModalshow: false,
    deleteType: false,
    manageGroups: true,
    addMembersModalshow: false
  };

  componentDidMount() {
    axios.get("/groups?_sort=name&_order=asc").then(res => {
      const groups = {};
      res.data.map(
        gr => (groups[gr.id] = { name: gr.name, members: gr.members })
      );
      this.setState({ groupList: groups });
    });

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
  }

  selectHandler = target => {
    let rList = [...this.state.selectedRecord];
    if (target.value) rList.push(parseInt(target.id));
    else rList.splice(rList.indexOf(parseInt(target.id)), 1);
    this.setState({ selectedRecord: rList });
  };

  checkAllGroups = checked => {
    let rList = [];
    if (checked) {
      __CHECK_ALL = true;
      rList = Object.keys({ ...this.state.groupList }).map(key => key);
    } else __CHECK_ALL = false;

    this.setState({ selectedRecord: rList });
  };

  // --------------------------- GROUPS FUNCTIONS ---------------------------

  addGroupHandler = () => {
    let gList = { ...this.state.groupList };
    const newId = Object.keys(gList).length
      ? Object.keys(gList)[Object.keys(gList).length - 1] * 1 + 1
      : "10000";
    const newGroup = {
      name: this.state.name,
      members: []
    };
    axios.post("/groups", newGroup).then(res => {
      if (res.status === 201) {
        delete newGroup.id;
        gList[newId] = newGroup;
        this.setState({ groupList: gList });
        this.resetTempData();
        this.setState({ groupModalshow: false });
      }
    });
  };

  editGroupModal = group => {
    __GROUP_ID = group.id;
    this.setState({ name: group.name });
    this.setState({ members: group.members });
    this.setState({ groupModalType: 1 });
    this.setState({ groupModalshow: true });
  };

  submitEditedGroup = () => {
    let gList = { ...this.state.groupList };
    const group = {
      id: __GROUP_ID,
      name: this.state.name,
      members: this.state.members
    };
    axios.put("/groups/" + __GROUP_ID, group).then(res => {
      if (res.status === 200) {
        delete group.id;
        gList[__GROUP_ID] = group;
        this.setState({ groupList: gList });
        this.setState({ groupModalshow: false });
        this.resetTempData();
      }
    });
  };

  resetTempData = () => {
    this.setState({ name: "" });
    this.setState({ members: [] });
    this.setState({ selectedRecord: [] });
    __CHECK_ALL = false;
  };

  closeGroupModal = () => {
    this.resetTempData();
    this.setState({ groupModalshow: false });
  };

  newGroupModal = () => {
    this.resetTempData();
    this.setState({ groupModalType: 0 });
    this.setState({ groupModalshow: true });
  };

  deleteGroupModal = id => {
    if (id != null) {
      __GROUP_ID = id;
      __DELETE_TYPE = false;
    } else __DELETE_TYPE = true;
    this.setState({ deleteModalshow: true });
  };

  closeDeleteModal = () => {
    this.setState({ deleteModalshow: false });
  };

  //Remove all subscribed employees from this group
  removeEmployeesFromGroup = (gr, grId, employeeList) => {
    return new Promise(resolve => {
      if (gr.members.length === 0) resolve(true);
      gr.members.forEach(empId => {
        let emp = { ...this.state.employeeList }[empId];
        emp.id = empId;
        employeeList[empId].groups.splice(
          employeeList[empId].groups.indexOf(parseInt(grId)),
          1
        );
        axios.put("/employees/" + empId, emp).then(res => {
          if (gr.members.indexOf(empId) === gr.members.length - 1)
            resolve(true);
        });
      });
    });
  };

  //Remove all selected groups and their subscribed employees
  deleteSelectedGroups = (recordList, groupList, employeeList) => {
    return new Promise(resolve => {
      recordList.forEach(grId =>
        this.removeEmployeesFromGroup(groupList[grId], grId, employeeList).then(
          res =>
            axios.delete("/groups/" + grId).then(res => {
              delete groupList[grId];
              this.setState({ groupList });
              if (recordList.indexOf(grId) === recordList.length - 1)
                resolve(true);
            })
        )
      );
    });
  };

  submitDeleteGroup = async () => {
    let gList = { ...this.state.groupList };
    let eList = { ...this.state.employeeList };
    if (!__DELETE_TYPE) {
      //Delete group from all employees
      await this.removeEmployeesFromGroup(gList[__GROUP_ID], __GROUP_ID, eList);
      // Delete selected group
      await axios.delete("/groups/" + __GROUP_ID);
      delete gList[__GROUP_ID];
      this.setState({ groupList: gList });
      // Remove from selected list
      if (this.state.selectedRecord.indexOf(__GROUP_ID) !== -1) {
        let rList = [...this.state.selectedRecord];
        rList.splice(rList.indexOf(__GROUP_ID), 1);
        this.setState({ selectedRecord: rList });
      }
    } else {
      await this.deleteSelectedGroups(this.state.selectedRecord, gList, eList);
      // Empty selected list
      this.setState({ selectedRecord: [] });
    }
    // Update employees and groups
    this.setState({ employeeList: eList });
    this.closeDeleteModal();
    this.resetTempData();
  };

  // --------------------------- MEMBERS FUNCTIONS ---------------------------
  manageMembersClick = grId => {
    this.setState({ manageGroups: false });
    __GROUP_ID = grId;
    this.resetTempData();
  };

  checkAllMembers = checked => {
    let mList = [];
    if (checked) {
      __CHECK_ALL = true;
      mList = [...this.state.groupList[__GROUP_ID].members];
    } else __CHECK_ALL = false;
    this.setState({ selectedRecord: mList });
  };

  removeMemberModal = memId => {
    if (memId !== null) {
      __MEMBER_ID = memId;
      __DELETE_TYPE = false;
    } else __DELETE_TYPE = true;
    this.setState({ deleteModalshow: true });
  };

  submitRemoveMember = async () => {
    let gList = { ...this.state.groupList };
    let eList = { ...this.state.employeeList };
    if (!__DELETE_TYPE) {
      //Delete one member from group
      let group = { ...gList[__GROUP_ID] };
      group.id = __GROUP_ID;
      group.members.splice(group.members.indexOf(parseInt(__MEMBER_ID)), 1);
      await axios.put("/groups/" + __GROUP_ID, group).then(res => {
        delete group.id;
        gList[__GROUP_ID] = group;
      });
      let member = { ...eList[__MEMBER_ID] };
      member.id = __MEMBER_ID;
      member.groups.splice(member.groups.indexOf(parseInt(__GROUP_ID)), 1);
      await axios.put("/employees/" + __MEMBER_ID, member).then(res => {
        delete member.id;
        eList[__MEMBER_ID] = member;
      });

      // Remove from selected list
      if (this.state.selectedRecord.indexOf(__MEMBER_ID) !== -1) {
        let rList = [...this.state.selectedRecord];
        rList.splice(rList.indexOf(__MEMBER_ID), 1);
        this.setState({ selectedRecord: rList });
      }
    } else {
      //Delete members from group
      await this.removeMembersFromGroup(
        this.state.selectedRecord,
        __GROUP_ID,
        gList,
        eList
      );
      // Empty selected list
      this.setState({ selectedRecord: [] });
    }
    //Update employees and groups
    this.setState({ employeeList: eList });
    this.setState({ groupList: gList });
    this.closeDeleteModal();
    this.resetTempData();
  };

  //Remove selected members from this group
  removeMembersFromGroup = (list, grId, groupList, employeeList) => {
    return new Promise(resolve => {
      let group = { ...groupList[grId] };
      group.id = grId;
      list.forEach(memId => {
        group.members.splice(group.members.indexOf(parseInt(memId)), 1);
        let member = { ...employeeList[memId] };
        member.id = memId;
        member.groups.splice(member.groups.indexOf(parseInt(grId)), 1);
        axios.put("/employees/" + memId, member).then(res => {
          delete member.id;
          employeeList[memId] = member;
          if (list.indexOf(memId) === list.length - 1) {
            axios.put("/groups/" + grId, group).then(res => {
              delete member.id;
              groupList[grId] = group;
              resolve(true);
            });
          }
        });
      });
    });
  };

  addMembersModal = () => {
    this.setState({ addMembersModalshow: true });
    this.resetTempData();
  };

  closeAddMembersModal = () => {
    this.setState({ addMembersModalshow: false });
    this.resetTempData();
  };

  checkAllListedEmployees = checked => {
    let mList = [];
    if (checked) {
      __CHECK_ALL = true;
      Object.keys(this.state.employeeList).forEach(id => {
        if (
          this.state.employeeList[id].groups.indexOf(parseInt(__GROUP_ID)) ===
          -1
        )
          mList.push(parseInt(id));
      });
    } else __CHECK_ALL = false;
    this.setState({ selectedRecord: mList });
  };

  //Add selected members to this group
  addMembersToGroup = (list, grId, groupList, employeeList) => {
    return new Promise(resolve => {
      let group = { ...groupList[grId] };
      group.id = grId;
      list.forEach(memId => {
        group.members.push(parseInt(memId));
        let member = { ...employeeList[memId] };
        member.id = memId;
        member.groups.push(parseInt(grId));
        axios.put("/employees/" + memId, member).then(res => {
          delete member.id;
          employeeList[memId] = member;
          if (list.indexOf(memId) === list.length - 1) {
            axios.put("/groups/" + grId, group).then(res => {
              delete member.id;
              groupList[grId] = group;
              resolve(true);
            });
          }
        });
      });
    });
  };

  submitAddMembers = async () => {
    let gList = { ...this.state.groupList },
      eList = { ...this.state.employeeList };
    await this.addMembersToGroup(
      this.state.selectedRecord,
      __GROUP_ID,
      gList,
      eList
    );
    this.setState({ employeeList: eList });
    this.setState({ groupList: gList });
    this.closeAddMembersModal();
    this.resetTempData();
  };

  render() {
    return (
      <>
        {this.state.manageGroups ? (
          <div className="container">
            <div className="table-wrapper">
              <ListHeader title={"Manage Groups"}>
                <AddButton
                  title={"Add New Group"}
                  onClick={this.newGroupModal}
                />
                <DeleteButton
                  title={"Delete"}
                  disabled={!this.state.selectedRecord.length}
                  onClick={() => this.deleteGroupModal(null)}
                />
              </ListHeader>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>
                      <span className="custom-checkbox">
                        <input
                          type="checkbox"
                          id="selectAll"
                          checked={__CHECK_ALL}
                          onChange={e => {
                            this.checkAllGroups(e.target.checked);
                          }}
                        ></input>
                        <label htmlFor="selectAll"></label>
                      </span>
                    </th>
                    <th>Name</th>
                    <th>Members</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(this.state.groupList).map(id => {
                    let group = this.state.groupList[id];
                    group.id = id;
                    group.memberCounts = group.members.length;
                    return (
                      <Group
                        key={id}
                        group={group}
                        checked={this.state.selectedRecord.indexOf(id) !== -1}
                        handleChecked={this.selectHandler}
                        onDelete={() => this.deleteGroupModal(id)}
                        onSave={() => this.editGroupModal(group)}
                        onClick={() => this.manageMembersClick(id)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="container">
            <div className="table-wrapper">
              <div className="table-title">
                <div className="row">
                  <div className="col-sm-6">
                    <h2>
                      <Breadcrumb>
                        <Breadcrumb.Item
                          href="#"
                          onClick={() => {
                            this.setState({ manageGroups: true });
                            this.resetTempData();
                          }}
                        >
                          Manage Groups
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>
                          {this.state.groupList[__GROUP_ID].name}
                        </Breadcrumb.Item>
                      </Breadcrumb>
                    </h2>
                  </div>
                  <div className="col-sm-6">
                    <AddButton
                      title={"Add Member"}
                      onClick={() => this.addMembersModal()}
                    />
                    <DeleteButton
                      title={"Remove"}
                      disabled={!this.state.selectedRecord.length}
                      onClick={() => this.removeMemberModal(null)}
                    />
                  </div>
                </div>
              </div>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>
                      <span className="custom-checkbox">
                        <input
                          type="checkbox"
                          id="selectAll"
                          checked={__CHECK_ALL}
                          onChange={e => {
                            this.checkAllMembers(e.target.checked);
                          }}
                        ></input>
                        <label htmlFor="selectAll"></label>
                      </span>
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.groupList[__GROUP_ID].members.map(id => {
                    let member = { ...this.state.employeeList[id] };
                    member.id = id;
                    return (
                      <Member
                        key={id}
                        emp={member}
                        action={true}
                        checked={
                          this.state.selectedRecord.indexOf(parseInt(id)) !== -1
                        }
                        handleChecked={this.selectHandler}
                        onRemove={() => this.removeMemberModal(id)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* --------------------------- ADD NEW & EDIT GROUP MODAL --------------------------- */}
        <Modal show={this.state.groupModalshow} onHide={this.closeGroupModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.groupModalType === 0 ? "Add New Group" : "Edit Group"}
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeGroupModal}>
              Cancel
            </Button>
            {this.state.groupModalType === 0 ? (
              <Button variant="success" onClick={this.addGroupHandler}>
                Add
              </Button>
            ) : (
              <Button variant="info" onClick={this.submitEditedGroup}>
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
            <Button
              variant="danger"
              onClick={
                this.state.manageGroups
                  ? this.submitDeleteGroup
                  : this.submitRemoveMember
              }
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>{" "}
        {/* --------------------------- ADD MEMBERS MODAL --------------------------- */}
        <Modal
          className={"lg"}
          show={this.state.addMembersModalshow}
          onHide={this.closeAddMembersModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Members</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table className="table table-striped table-hover table-modal-scrollY">
              <thead>
                <tr>
                  <th>
                    <span className="custom-checkbox">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={__CHECK_ALL}
                        onChange={e => {
                          this.checkAllListedEmployees(e.target.checked);
                        }}
                      ></input>
                      <label htmlFor="selectAll"></label>
                    </span>
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.state.employeeList).map(id => {
                  let employee = this.state.employeeList[id];
                  employee.id = id;
                  if (employee.groups.indexOf(parseInt(__GROUP_ID)) === -1)
                    return (
                      <Member
                        key={id}
                        emp={employee}
                        action={false}
                        checked={
                          this.state.selectedRecord.indexOf(parseInt(id)) !== -1
                        }
                        handleChecked={this.selectHandler}
                      />
                    );
                  return null;
                })}
              </tbody>
            </table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeAddMembersModal}>
              Cancel
            </Button>
            <Button variant="success" onClick={this.submitAddMembers}>
              Add
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default Groups;
