import moment from "moment";
import React, { Component } from "react";
import Swal from "sweetalert2";
import { server } from "../../constance/constance";
import { httpClient } from "../../utils/HttpClient";

const PAGE_SIZE = 50;

const PAGE_ACCESS_USERNAME = "admin";
const PAGE_ACCESS_PASSWORD = "tnadmin";
const ACTION_CONFIRM_PASSWORD = "tnadmin";

class Master_rfid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data_table: [],
      count_item: 0,
      mode: "add",
      emp: "",
      rfid: "",
      fname: "",
      lname: "",
      search_keyword: "",
      current_page: 1,
      authenticated: false,
      login_user: "",
      login_pass: "",
    };
  }

  componentDidMount = async () => {
    const saved = sessionStorage.getItem("master_rfid_auth");
    if (saved === "true") {
      this.setState({ authenticated: true });
      this.getData();
    }
  };

  handleLogin = () => {
    const { login_user, login_pass } = this.state;

    if (
      login_user === PAGE_ACCESS_USERNAME &&
      login_pass === PAGE_ACCESS_PASSWORD
    ) {
      sessionStorage.setItem("master_rfid_auth", "true");
      this.setState({ authenticated: true, login_user: "", login_pass: "" });
      this.getData();
    } else {
      Swal.fire({
        icon: "error",
        title: "Username หรือ Password ไม่ถูกต้อง",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  // ยืนยัน password อีกครั้งก่อนทำ Edit/Update/Delete คืนค่า true ถ้าผ่าน
  confirmActionPassword = async (actionLabel) => {
    const { value: pwd, isConfirmed } = await Swal.fire({
      title: `กรอกรหัสผ่านเพื่อยืนยัน${actionLabel}`,
      input: "password",
      inputPlaceholder: "รหัสผ่าน",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!isConfirmed) return false;

    if (pwd !== ACTION_CONFIRM_PASSWORD) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ถูกต้อง",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }

    return true;
  };

  handleLogout = () => {
    sessionStorage.removeItem("master_rfid_auth");
    this.setState({ authenticated: false });
  };

  getData = async () => {
    try {
      let res = await httpClient.get(server.GET_MASTER_RFID);
      if (res.data.message === "ok") {
        this.setState({
          data_table: res.data.data,
          count_item: res.data.data.length,
          current_page: 1,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  handleClear = () => {
    this.setState({
      mode: "add",
      emp: "",
      rfid: "",
      fname: "",
      lname: "",
    });
  };

  handleEdit = (item) => {
    this.setState({
      mode: "edit",
      emp: item.emp,
      rfid: item.rfid,
      fname: item.fname || "",
      lname: item.lname || "",
    });
  };

  handleSave = async () => {
    try {
      let { emp, rfid, fname, lname, mode } = this.state;
      if (!emp || !rfid || !fname || !lname) {
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกข้อมูลให้ครบถ้วน",
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      if (mode === "edit") {
        const passed = await this.confirmActionPassword("การแก้ไขข้อมูล");
        if (!passed) return;
      }

      let res =
        mode === "edit"
          ? await httpClient.post(server.UPDATE_MASTER_RFID, {
            emp,
            rfid,
            fname,
            lname,
          })
          : await httpClient.post(server.IN_MASTER_RFID, {
            emp,
            rfid,
            fname,
            lname,
          });

      if (res.data.message === "ok") {
        Swal.fire({
          icon: "success",
          title:
            mode === "edit"
              ? "แก้ไขข้อมูลเรียบร้อยแล้ว"
              : "บันทึกข้อมูลเรียบร้อยแล้ว",
          showConfirmButton: false,
          timer: 1500,
        });
        this.handleClear();
        this.getData();
      } else if (res.data.data === "dup_emp") {
        Swal.fire({
          icon: "error",
          title: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว",
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (res.data.data === "dup_rfid") {
        Swal.fire({
          icon: "error",
          title: "บัตร RFID นี้ถูกใช้งานแล้ว",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  handleDelete = (emp) => {
    Swal.fire({
      icon: "warning",
      title: `ต้องการลบข้อมูลพนักงาน ${emp} ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const passed = await this.confirmActionPassword("การลบข้อมูล");
      if (!passed) return;

      try {
        let res = await httpClient.post(server.DELETE_MASTER_RFID, { emp });
        if (res.data.message === "ok") {
          Swal.fire({
            icon: "success",
            title: "ลบข้อมูลเรียบร้อยแล้ว",
            showConfirmButton: false,
            timer: 1500,
          });
          if (this.state.emp === emp) this.handleClear();
          this.getData();
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาดในการลบข้อมูล",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    });
  };

  // ---------- search ----------
  handleSearchChange = (field, value) => {
    this.setState({ [field]: value, current_page: 1 });
  };

  handleClearSearch = () => {
    this.setState({ search_keyword: "", current_page: 1 });
  };

  getFilteredData = () => {
    const { data_table, search_keyword } = this.state;
    const keyword = search_keyword.trim().toLowerCase();
    if (!keyword) return data_table;

    return data_table.filter((item) => {
      const emp = (item.emp || "").toLowerCase();
      const fname = (item.fname || "").toLowerCase();
      const lname = (item.lname || "").toLowerCase();
      return emp.includes(keyword) || fname.includes(keyword) || lname.includes(keyword);
    });
  };

  goToPage = (page) => {
    this.setState({ current_page: page });
  };

  renderPagination = (total_page) => {
    const { current_page } = this.state;

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          disabled={current_page <= 1}
          onClick={() => this.goToPage(1)}
        >
          {"<<"}
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          disabled={current_page <= 1}
          onClick={() => this.goToPage(current_page - 1)}
        >
          {"<"}
        </button>
        <span className="mx-2">
          Page {current_page} / {total_page}
        </span>
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          disabled={current_page >= total_page}
          onClick={() => this.goToPage(current_page + 1)}
        >
          {">"}
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          disabled={current_page >= total_page}
          onClick={() => this.goToPage(total_page)}
        >
          {">>"}
        </button>
      </div>
    );
  };

  renderTable = (page_data) => {
    return page_data.map((item, index) => (
      <tr key={index}>
        <td className="text-center">{item.emp}</td>
        <td className="text-center">{item.rfid}</td>
        <td className="text-center">{item.fname}</td>
        <td className="text-center">{item.lname}</td>
        <td className="text-center">
          {item.mfg_date ? moment(item.mfg_date).format("DD/MM/YYYY") : ""}
        </td>
        <td className="text-center">
          <button
            className="btn btn-warning btn-sm py-0 me-1"
            type="button"
            onClick={() => this.handleEdit(item)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm py-0"
            type="button"
            onClick={() => this.handleDelete(item.emp)}
          >
            Delete
          </button>
        </td>
      </tr>
    ));
  };

  renderLogin = () => {
    return (
      <div className="content-wrapper">
        <div className="conent" id="font-web">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="card" style={{ maxWidth: "380px", width: "100%" }}>
              <div className="card-body">
                <h4 className="text-center mb-4">
                  <b>Master RFID - Login</b>
                </h4>

                <div className="mb-3">
                  <label className="fw-bold mb-1">Username</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    autoFocus
                    value={this.state.login_user}
                    onChange={(e) =>
                      this.setState({ login_user: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") this.handleLogin();
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="fw-bold mb-1">Password</label>
                  <input
                    className="form-control form-control-sm"
                    type="password"
                    value={this.state.login_pass}
                    onChange={(e) =>
                      this.setState({ login_pass: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") this.handleLogin();
                    }}
                  />
                </div>

                <button
                  className="btn btn-info text-white w-100 fw-bold"
                  type="button"
                  onClick={this.handleLogin}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (!this.state.authenticated) {
      return this.renderLogin();
    }

    const { mode, current_page } = this.state;

    const filtered_data = this.getFilteredData();
    const total_page = Math.max(1, Math.ceil(filtered_data.length / PAGE_SIZE));
    const safe_page = Math.min(current_page, total_page);
    const start_index = (safe_page - 1) * PAGE_SIZE;
    const page_data = filtered_data.slice(start_index, start_index + PAGE_SIZE);

    return (
      <div className="content-wrapper">
        <div className="conent" id="font-web">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div style={{ width: "80px" }} />
            <h3 className="mb-0">
              <b>Master RFID</b>
            </h3>
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              onClick={this.handleLogout}
            >
              Logout
            </button>
          </div>


          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-column align-items-center mb-4">
                <div style={{ maxWidth: "450px", width: "100%" }}>
                  <div className="row g-2 align-items-center mb-2">
                    <div className="col-4 text-end">
                      <label className="fw-bold mb-0">Card (RFID):</label>
                    </div>
                    <div className="col-8">
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        autoFocus
                        placeholder="Scan Card (RFID)"
                        value={this.state.rfid}
                        onChange={(e) =>
                          this.setState({ rfid: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="row g-2 align-items-center mb-2">
                    <div className="col-4 text-end">
                      <label className="fw-bold mb-0">Emp:</label>
                    </div>
                    <div className="col-8">
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Employee ID"
                        value={this.state.emp.toUpperCase()}
                        readOnly={mode === "edit"}
                        onChange={(e) =>
                          this.setState({ emp: e.target.value.toUpperCase() })
                        }
                      />
                    </div>
                  </div>

                  <div className="row g-2 align-items-center mb-2">
                    <div className="col-4 text-end">
                      <label className="fw-bold mb-0">First Name:</label>
                    </div>
                    <div className="col-8">
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="First Name"
                        value={this.state.fname}
                        onChange={(e) =>
                          this.setState({ fname: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="row g-2 align-items-center mb-3">
                    <div className="col-4 text-end">
                      <label className="fw-bold mb-0">Last Name:</label>
                    </div>
                    <div className="col-8">
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Last Name"
                        value={this.state.lname}
                        onChange={(e) =>
                          this.setState({ lname: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-8 offset-4 d-flex gap-2">
                      <button
                        className="btn btn-info btn-sm text-white px-3 fw-bold"
                        type="button"
                        onClick={this.handleSave}
                      >
                        {mode === "edit" ? "Update" : "Save"}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm px-3"
                        type="button"
                        onClick={this.handleClear}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* search + page size bar */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 mb-3 bg-light border rounded">
                <div className="d-flex align-items-center gap-2" style={{ minWidth: "260px", flex: "1 1 260px" }}>
                  <span className="text-muted">🔍</span>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="ค้นหา รหัสพนักงาน / ชื่อ / นามสกุล"
                    value={this.state.search_keyword}
                    onChange={(e) => this.handleSearchChange("search_keyword", e.target.value)}
                  />
                  {this.state.search_keyword && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      type="button"
                      onClick={this.handleClearSearch}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-md-12">
                  <div className="text-end text-danger fw-bold mb-2">
                    Total: {filtered_data.length} Item.
                  </div>

                  <div
                    className="table-responsive border rounded"
                    style={{ maxHeight: "50vh", overflowY: "auto" }}
                  >
                    <table className="table table-bordered table-striped table-sm m-0">
                      <thead
                        className="table-light sticky-top text-center align-middle"
                        style={{ zIndex: 10, backgroundColor: "#dadada" }}
                      >
                        <tr>
                          <th>Employee No</th>
                          <th>Card (RFID)</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Register Date</th>
                          <th style={{ width: "15%" }}>Action</th>
                        </tr>
                      </thead>

                      <tbody>{this.renderTable(page_data)}</tbody>
                    </table>
                  </div>

                  {this.renderPagination(total_page)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Master_rfid;
