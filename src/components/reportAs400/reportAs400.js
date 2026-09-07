import React, { Component } from "react";
import { server } from "../../constance/constance";
import { httpClient } from "../../utils/HttpClient";
import "./reportAs400.css";
import * as moment from "moment";
import Swal from "sweetalert2";
import { MagnifyingGlass } from "react-loader-spinner";

class ReportAs400 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_table: [],
      item_no: "",
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
      count_item: 0,
      dataQty: [],
      loading: "on",
    };
  }

  componentDidMount = async () => {
    this.getData();
  };

  getData = async () => {
    let getdata = await httpClient.post(server.API_GET_DATA_WIP_STORE_MC_SHOP, {
      start_date: this.state.start_date,
      end_date: this.state.end_date,
    });

    if (getdata.data.result.length > 0) {
      this.setState({
        data_table: getdata.data?.result,
        dataQty: getdata.data?.sumQty,
        count_item: getdata.data.result.length,
        loading: "off",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลของวันที่ " + this.state.start_date,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        this.setState({ loading: "off", count_item: 0 });
      });
    }
  };

  renderTable = () => {
    try {
      if (this.state.data_table !== null) {
        // console.log(this.state.data_table);
        return this.state.data_table.map((item, index) => (
          <tr key={index}>
            <td style={{ padding: "3px" }}>{item.proD_DATE}</td>
            <td style={{ padding: "3px" }}>{item.proD_SHIFT}</td>
            <td style={{ padding: "3px" }}>{item.loca}</td>
            <td style={{ padding: "3px" }}>{item.machine}</td>
            <td style={{ padding: "3px" }}>{item.parT_NO}</td>
            <td style={{ padding: "3px" }}>{item.pos}</td>
            <td style={{ padding: "3px" }}>{item.box}</td>
            <td style={{ padding: "3px" }}>{item.type}</td>
            <td style={{ padding: "3px" }}>
              {item.loca === "AF" ? item.qty : ""}
            </td>
            <td style={{ padding: "3px" }}>
              {item.loca === "SEL" ? item.qty : ""}
            </td>
            <td style={{ padding: "3px" }}>{item.operator}</td>
          </tr>
          // </tbody>
        ));
      }
    } catch (error) {
      console.log(error, "table");
    }
  };

  renderTable_foot() {
    const { dataQty } = this.state;

    const qtyAF = dataQty.find((item) => item.loca === "AF")?.total_qty || 0;

    const qtyS = dataQty.find((item) => item.loca === "SEL")?.total_qty || 0;

    return (
      <tr>
        <th colSpan={8} className="fw-bold text-center">
          Total
        </th>
        <th style={{ textAlign: "right" }}>{qtyAF.toLocaleString()}</th>
        <th style={{ textAlign: "right", color: "red" }}>
          {qtyS.toLocaleString()}
        </th>
        <td></td>
      </tr>
    );
  }
  handleStartDate = async (e) => {
    const start_date = e.target.value;
    await this.setState({ start_date: start_date });
    // this.searchData(start_date, this.state.end_date);
    // });
  };

  handleEndDate = async (e) => {
    const end_date = e.target.value;
    await this.setState({ end_date: end_date });
    // this.searchData(this.state.start_date, end_date);
  };

  searchData = async (start, end) => {
    try {
      let find = await httpClient.post(server.API_GET_DATA_WIP_STORE_MC_SHOP, {
        start_date: start,
        end_date: end,
      });
      if (find.data.result.length > 0) {
        this.setState({
          data_table: find.data.result,
          dataQty: find.data?.sumQty,
          count_item: find.data.result.length,
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "ไม่พบข้อมูล",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          this.setState({ loading: "off", count_item: 0 });
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: error.message,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        this.setState({ loading: "off" });
      });
      return;
    }
  };

  loadingScreen = () => {
    if (this.state.loading === "on") {
      return (
        <div className="overlay-vi">
          <MagnifyingGlass
            visible={true}
            height="80"
            width="80"
            ariaLabel="magnifying-glass-loading"
            wrapperStyle={{}}
            wrapperClass="magnifying-glass-wrapper"
            glassColor="#c0efff"
            color="#e15b64"
          />
        </div>
      );
    }
  };

  exportToExcel = () => {
    // .csv
    const { data_table, start_date, end_date } = this.state;

    // Define the header row
    const header = [
      "PROD DATE",
      "SHIFT",
      "LOCATION",
      "M/C NO.",
      "PART NO.",
      "POS.",
      "BOX",
      "TYPE",
      "Q'TY",
      "Q'TY NG",
      "OPERATOR",
    ];
    let txt = `TN_Report_dataAS400_${start_date}_to_${end_date}`;

    const formatCell = (cell) => {
      const value = cell === null || cell === undefined ? "" : String(cell);
      // ถ้ามี " ในข้อความ ให้เปลี่ยนเป็น "" (Double double quotes) ตามมาตรฐาน CSV
      // แล้วหุ้มทั้งหมดด้วย " "
      return `"${value.replace(/"/g, '""')}"`;
    };

    const csvRows = [
      header.map(formatCell).join(","), // จัดการ Header
      ...data_table.map((row) =>
        [
          row.proD_DATE,
          row.proD_SHIFT,
          row.loca,
          row.machine,
          row.parT_NO,
          row.pos,
          row.box,
          row.type,
          row.loca === "AF" ? row.qty : "",
          row.loca === "SEL" ? row.qty : "",
          row.operator,
        ]
          .map(formatCell)
          .join(",")
      ),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    // เติม \uFEFF (BOM) เพื่อให้ Excel อ่านภาษาไทย/สัญลักษณ์พิเศษได้ถูกต้อง

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", txt + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  render() {
    return (
      <div className="content-wrapper">
        <div className="content" id="font-web">
          <h3 className="row justify-content-center">
            <b>History By Data AS400</b>
          </h3>
          <div className="card">
            <div className="card-body">
              <div
                className="row"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  // paddingTop: "10px",
                }}
              >
                {/* <div className="d-flex align-items-center"> */}
                <div className="col-auto">
                  <b>From date: </b>
                </div>
                <div className="col-auto">
                  <input
                    className="form-control form-control-sm"
                    type="date"
                    value={this.state.start_date}
                    onChange={this.handleStartDate}
                    style={{ alignItems: "center" }}
                  ></input>
                </div>
                {/* </div> */}
                <div className="col-auto">
                  <b>To date: </b>
                </div>
                <div className="col-auto">
                  <input
                    className="form-control form-control-sm"
                    type="date"
                    value={this.state.end_date}
                    onChange={this.handleEndDate}
                  ></input>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      this.searchData(
                        this.state.start_date,
                        this.state.end_date
                      );
                    }}
                  >
                    Search
                  </button>
                  {/* <img
                    src="images/icon/reloading.png"
                    alt="refresh"
                    style={{ height: 30, width: 30 }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.reload();
                      // this.getData();
                    }}
                  /> */}
                </div>
                <div>
                  <button
                    className="btn btn-primary btn-sm"
                    // style={{ marginLeft: 10 }}
                    onClick={this.exportToExcel}
                  >
                    Export Excel
                  </button>
                </div>
              </div>
              <div className="row justify-content-end" style={{ color: "red" }}>
                Total: {this.state.count_item} Item.
              </div>
              <div className="row justify-content-center">
                <div className="col-md-12">
                  {this.loadingScreen()}
                  {/* <div
                    className="table-responsive"
                    style={{ height: "calc(100vh - 200px)" }}
                  >
                    <table
                      className="table table-bordered"
                      style={{ borderCollapse: "collapse", width: "100%" }}
                    > */}
                  {/* <thead
                        style={{
                          textAlign: "center",
                          backgroundColor: "#dadada",
                        }}
                      > */}
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <table className="table table-bordered table-sm m-0">
                      <thead
                        className="table-light sticky-top"
                        style={{
                          zIndex: 10,
                          textAlign: "center",
                          backgroundColor: "#dadada",
                        }}
                      >
                        <tr>
                          <th>PROD DATE</th>
                          <th>SHIFT</th>
                          <th>LOCATION</th>
                          <th>M/C NO.</th>
                          <th>PART NO.</th>
                          <th>POS.</th>
                          <th>BOX.</th>
                          <th>TYPE</th>
                          <th>Q'TY</th>
                          <th style={{ color: "red" }}>Q'TY NG</th>
                          <th>OPERATOR</th>
                        </tr>
                      </thead>

                      <tbody>{this.renderTable()}</tbody>
                      <tfoot
                        className="table-light sticky-bottom"
                        style={{ zIndex: 9, borderTop: "2px solid #dadada" }}
                      >
                        {this.renderTable_foot()}
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

export default ReportAs400;
