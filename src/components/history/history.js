import React, { Component } from "react";
import { server } from "../../constance/constance";
import { httpClient } from "../../utils/HttpClient";
import Select from "react-select";
import * as moment from "moment";
import Swal from "sweetalert2";
import { MagnifyingGlass } from "react-loader-spinner";

class History extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_table: [],
      item_no: "",
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
      count_item: 0,
      loading: "on"
    };
  }

  componentDidMount = async () => {
    this.getData();

  };

  getData = async () => {
    let getdata = await httpClient.post(server.FIND_VISUAL_ALL, {
        start_date: this.state.start_date,
        end_date: this.state.end_date,
      });

      if (getdata.data.result.length > 0) {
        this.setState({
          data_table: getdata.data.result,
          count_item: getdata.data.result.length,
          loading: "off",
        });
        
      } else {
        Swal.fire({
          icon: "error",
          title:  "ไม่พบข้อมูลของวันที่ " + this.state.start_date,
          showConfirmButton: false,
          timer: 2000
        }).then(()=>{
          this.setState({ loading: "off"})
        })
      }
  };

  renderTable = () => {
    try {
      if (this.state.data_table !== null) {
        // console.log(this.state.data_table);
        // console.log("pp");
        return this.state.data_table.map((item, index) => (
          // <tbody>
          <tr key={index}>
            <td style={{ padding: "3px" }}>{item.prod_date}</td>
            <td style={{ padding: "3px" }}>{item.shifts}</td>
            <td style={{ padding: "3px" }}>{item.mc_no}</td>
            <td style={{ padding: "3px" }}>{item.part}</td>
            <td style={{ padding: "3px" }}>{item.pos}</td>
            <td style={{ padding: "3px" }}>{item.box}</td>
            <td style={{ padding: "3px" }}>{item.type}</td>
            <td style={{ padding: "3px" }}>{item.qtyOk}</td>
            <td style={{ padding: "3px" }}>{item.qtyNg}</td>
            <td style={{ padding: "3px" }}>{item.rejBy}</td>
            <td style={{ padding: "3px" }}>{item.caseNg}</td>
          </tr>
          // </tbody>
        ));
      }
    } catch (error) {
      console.log(error, "table");
    }
  };


  handleStartDate = async (e) => {
    const start_date = e.target.value;
    await this.setState({ start_date: start_date });
    this.searchData(start_date, this.state.end_date);
    // });
  };

  handleEndDate = async (e) => {
    const end_date = e.target.value;
    await this.setState({ end_date: end_date });
    this.searchData(this.state.start_date, end_date);
  };

  searchData = async (start, end) => {
    try {
      let find = await httpClient.post(server.FIND_VISUAL_ALL, {
        start_date: start,
        end_date: end,
      });
      // console.log(find.data);
      if (find.data.result.length > 0) {
        this.setState({
          data_table: find.data.result,
          count_item: find.data.result.length,
        });
      }  else {
        Swal.fire({
          icon: "error",
          title:  "ไม่พบข้อมูล",
          showConfirmButton: false,
          timer: 2000
        }).then(()=>{
          this.setState({ loading: "off"})
        })
      }
    } catch (error) {
      console.log(error);
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
  render() {
    return (
      <div className="content-wrapper">
        <div className="content" id="font-web">
          <h3 className="row justify-content-center"><b>History</b></h3>
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
                <div>
                  <img
                    src="images/icon/reloading.png"
                    alt="refresh"
                    style={{ height: 30, width: 30 }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.reload();
                      // this.getData();
                    }}
                  />
                </div>
              </div>
              <div className="row justify-content-end" style={{ color: "red" }}>
                Total: {this.state.count_item} Item.
              </div>
              <div className="row justify-content-center">
                <div className="col-md-12">
                  {this.loadingScreen()}
                <div className="table-responsive" style={{ height: "calc(100vh - 200px)"}}>
                  <table
                    className="table table-bordered"
                    style={{ borderCollapse: "collapse", width: "100%" }}
                  >
                    <thead style={{ textAlign: "center" , backgroundColor: "#dadada"}}>
                    <tr>
                      <th>PROD DATE</th>
                      <th>SHIFT</th>
                      <th>M/C NO.</th>
                      <th>PART NO.</th>
                      <th>POS.</th>
                      <th>BOX.</th>
                      <th>TYPE</th>
                      <th>Q'TY OK</th>
                      <th style={{ color: "red"}}>Q'TY NG</th>
                      <th>REJECT BY</th>
                      <th>CASE NG</th>
                    </tr>
                    </thead>

                    <tbody>{this.renderTable()}</tbody>
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

export default History;
