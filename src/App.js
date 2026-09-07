import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/footer";
import Header from "./components/header/header";
import History from "./components/history/history";
import Home from "./components/home/home";
import Input_visual from "./components/input_visual/input_visual";
import Sidebar from "./components/sidebar/sidebar";
import ReportAs400 from "./components/reportAs400/reportAs400";
import Master_rfid from "./components/master_rfid/master_rfid";

function App() {
  return (
    <BrowserRouter>
      <div className="container-scroller">
        <Header />
        <div className="container-fluid page-body-wrapper">
          <Sidebar />

          <div className="main-panel">
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/inputv" element={<Input_visual />} />
              <Route path="/his-v" element={<History />} />
              <Route path="/hisWIP" element={<ReportAs400 />} />
              <Route path="/register-rfid" element={<Master_rfid />} />

              <Route exact={true} path="/" element={<Input_visual />} />
              <Route exact={true} path="*" element={<Input_visual />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
