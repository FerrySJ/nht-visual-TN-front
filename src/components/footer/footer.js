import React, { Component } from "react";
import "./footer.css";

import Tooltip from "@mui/material/Tooltip";

class Footer extends Component {
  render() {
    return (
      <footer className="main-footer text-lg-start">
        <Tooltip title="Development By Supattra Chanthaban (T9587)" arrow>
          <b>NHT @MINEBEAMITSUMI BPI.</b>
        </Tooltip>
        <div className="float-right d-none d-sm-inline-block">
          <b>Version 0.0.5</b>
          {/* <b>VersionTest 0.0.0</b> */}
        </div>
      </footer>
    );
  }
}
export default Footer;
