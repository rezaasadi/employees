import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { createBrowserHistory } from "history";

import "./App.css";
import SideBar from "./components/Navigation/SideBar";
import Employees from "./components/Employees";
import Groups from "./components/Groups";

function App() {
  const history = createBrowserHistory();
  const [active, setActive] = useState();
  useEffect(() => {
    setActive(history.location.pathname || "/employees");
  },[history.location.pathname]);
  return (
    <Router>
      <div className="wrapper">
        <SideBar>
          <li className={active === "/employees" ? "active" : ""}>
            <Link to="/employees" onClick={() => setActive("/employees")}>
              List Of Employees
            </Link>
          </li>
          <li
            className={active === "/groups" ? "active" : ""}
            onClick={() => setActive("/groups")}
          >
            <Link to="/groups">List Of Groups</Link>
          </li>
        </SideBar>
        <Switch>
          <Route path="/employees">
            <Employees />
          </Route>
          <Route path="/groups">
            <Groups />
          </Route>
          <Route path="/">
            <Employees />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
