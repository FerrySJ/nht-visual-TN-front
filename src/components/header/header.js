import React, { Component } from "react";
import { key } from "../../constance/constance";
import "./header.css";

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: "none",
      show_user: "none",
      levelUser: localStorage.getItem(key.USER_LV),
    };
  }
  async componentDidMount() {
    if (localStorage.getItem(key.LOGIN_PASSED) === "YES") {
      this.setState({ show: "block" });
    } else {
      this.setState({ show: "none" });
    }
  }

  handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem(key.USER_EMP)
    localStorage.removeItem(key.USER_LV)
    localStorage.removeItem(key.USER_US)
    localStorage.removeItem(key.SECTION)
    localStorage.setItem(key.LOGIN_PASSED, "NO")
    window.location.replace("/home");
  };

  render() {
    return (
      <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
  <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
    <a className="navbar-brand brand-logo mr-5" href="s_home"><img src="images/icon/hlogo.svg" className="mr-2" alt="logo" style={{height: 40}}/></a>
    <a className="navbar-brand brand-logo-mini" href="s_home"><img src="images/icon/logoMC.svg" alt="logo" style={{height: 35}}/></a>
  </div>
  <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
    <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
      <span className="icon-menu" />
    </button>
    <ul className="navbar-nav mr-lg-2">
      
    </ul>
    
    <ul className="navbar-nav navbar-nav-right" >
          {/* <li className="nav-item nav-profile dropdown">
            <p style={{ display: this.state.show }}>Employee No : <b>{localStorage.getItem(key.USER_EMP)} ( {localStorage.getItem(key.USER_LV)} )</b></p>
            <a className="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown"  style={{ display: this.state.show }}>
              <img src="images/icon/user.png" alt="profile" style={{ height: 35, width: 35 }}/>
            </a>
          </li> */}
        </ul>
  </div>
</nav>

    );
  }
}

export default Header;
