import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import Swal from "sweetalert2";

class Master_rfid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data_table: [],
      item_no: 0,
      emp: "",
      rfid: "",
      mfg_date: moment().format("YYYY-MM-DD"),
    };
  }

  handleSave = async () => {
    try {
      let { emp, rfid } = this.state;
      if (!emp || !rfid) {
        alert("Please fill in all required fields.");
        Swal.fire({
          icon: "warning",
          text: "กรุณากรอกข้อมูลให้ครบถ้วน",
        });
        return;
      }

      console.log("Saving data:", { emp, rfid });
      let data = await axios.post("register-rfid/inRFID", { emp, rfid });
      if (data.data.message === "ok") {
        if (data.data.data.length > 0) {
          Swal.fire({
            icon: "success",
            text: "บันทึกข้อมูลเรียบร้อยแล้ว",
            showConfirmButton: false,
            timer: 1500,
            didClose: () => {
              this.setState({ emp: "", rfid: "" });
            },
          });
        } else {
          Swal.fire({
            icon: "error",
            text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  render() {
    return (
      <div className="content-wrapper">
        <div className="conent" id="font-web">
          <h3 className="row justify-content-center">
            <b>Master RFID</b>
          </h3>

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

                  {/* แถวที่ 2: Emp */}
                  <div className="row g-2 align-items-center mb-3">
                    <div className="col-4 text-end">
                      <label className="fw-bold mb-0">Emp:</label>
                    </div>
                    <div className="col-8">
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Employee ID"
                        value={this.state.emp.toUpperCase()}
                        onChange={(e) =>
                          this.setState({ emp: e.target.value.toUpperCase() })
                        }
                      />
                    </div>
                  </div>

                  {/* ปุ่มกด Action */}
                  <div className="row">
                    <div className="col-8 offset-4 d-flex gap-2">
                      <button
                        className="btn btn-info btn-sm text-white px-3 fw-bold"
                        type="button"
                        onClick={this.handleSave}
                      >
                        Save
                      </button>
                      <button className="btn btn-secondary btn-sm px-3">
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-md-12">
                  <div className="text-end text-danger fw-bold mb-2">
                    Total: {this.state.count_item || 0} Item.
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
                          <th style={{ width: "40%" }}>Employee No</th>
                          <th style={{ width: "40%" }}>Card (RFID)</th>
                          <th style={{ width: "20%" }}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* {this.renderTable()} */}
                        <tr>
                          <td className="text-center">EMP001</td>
                          <td className="text-center">1234567890</td>
                          <td className="text-center">
                            <button className="btn btn-danger btn-sm py-0">
                              Delete
                            </button>
                          </td>
                        </tr>
                      </tbody>

                      <tfoot
                        className="table-light sticky-bottom"
                        style={{ zIndex: 9, borderTop: "2px solid #dadada" }}
                      >
                        {/* {this.renderTable_foot()} */}
                      </tfoot>
                    </table>
                  </div>
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
