import React, { Component } from "react";
import { key } from "../../constance/constance";

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: "none",
      show_req_store: "none",
      show_req_pur: "none",
      show_req_tool: "none",
      show_issue: "none",
      levelUser: localStorage.getItem(key.USER_LV),
      page: localStorage.getItem(key.SECTION),
    };
  }

  render() {
    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <ul className="nav">
          <li className="nav-item">
            <a className="nav-link" href="/inputv">
              <i className="icon-grid menu-icon"></i>
              <span className="menu-title">Visual</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/his-v">
              <i className="ti-menu-alt menu-icon"></i>
              <span className="menu-title">History</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/hisWIP">
              <i className="ti-menu-alt menu-icon"></i>
              <span className="menu-title">History By AS400</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/register-rfid">
              <i className="ti-user menu-icon"></i>
              <span className="menu-title">Register Master Card</span>
            </a>
          </li>

          {/* Admin */}
          {/* <li className="nav-item" style={{ display: this.state.show }}>
            <a
              className="nav-link"
              data-toggle="collapse"
              href="#auth"
              aria-expanded="false"
              aria-controls="auth"
            >
              <i className="icon-head menu-icon"></i>
              <span className="menu-title">User Pages</span>
              <i className="menu-arrow"></i>
            </a>
            <div className="collapse" id="auth">
              <ul className="nav flex-column sub-menu">
                <li className="nav-item">
                  <a className="nav-link" href="/mc_regis">
                    Register
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/mc_user">
                    List User
                  </a>
                </li>
              </ul>
            </div>
          </li> */}
          {/* Master */}
          {/* <li className="nav-item" style={{ display: this.state.show }}>
            <a
              className="nav-link"
              data-toggle="collapse"
              href="#masters"
              aria-expanded="false"
              aria-controls="masters"
            >
              <i className="ti-server menu-icon"></i>
              <span className="menu-title">Masters</span>
              <i className="menu-arrow"></i>
            </a>
            <div className="collapse" id="masters">
              <ul className="nav flex-column sub-menu">
                <li className="nav-item">
                  <a className="nav-link" href="/section">
                    Section
                  </a>
                </li>
              </ul>
            </div>
          </li> */}
        </ul>
      </nav>
    );
  }
}

export default Sidebar;
