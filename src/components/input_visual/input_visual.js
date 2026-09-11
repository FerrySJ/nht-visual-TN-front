import React, { useState, useRef } from "react";
import * as moment from "moment";
import Swal from "sweetalert2";
import "./input_visual.css";
import { httpClient } from "../../utils/HttpClient";
import { server } from "../../constance/constance";
import { MagnifyingGlass } from "react-loader-spinner";

const Input_visual = () => {
  // กำหนด state สำหรับการเก็บข้อมูลของแต่ละแถว
  const [rows, setRows] = useState([
    {
      prod_date: moment().subtract(1, "days").format("YYYY-MM-DD"),
      shift: "M",
      mc: "",
      part: "",
      pos: "",
      box: "",
      type: "",
      qtyOk: "",
      qtyNg: "",
      rejBy: "",
      caseNg: "",
    }, // แถวเริ่มต้น
  ]);
  const [shifts, setShifts] = useState(
    moment().format("HH:mm:ss") >= "07:00" &&
      moment().format("HH:mm:ss") < "18:59"
      ? "M"
      : "N"
  );
  const [mfg_date, setMfg_date] = useState(moment().format("YYYY-MM-DD"));
  const [oper, setOper] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [loading, setLoading] = useState("off");
  const operTimer = useRef(null);

  const checkOperRfid = async (value) => {
    if (!value) {
      setOperatorName("");
      return;
    }
    try {
      let res = await httpClient.post(server.CHECK_MASTER_RFID, {
        rfid: value,
      });

      if (res.data.message === "ok" && res.data.data) {
        const found = res.data.data;
        setOper(found.emp);
        setOperatorName(`${found.fname || ""} ${found.lname || ""}`.trim());
      } else {
        setOper("");
        setOperatorName("");
        Swal.fire({
          icon: "warning",
          title: "ไม่พบข้อมูลบัตร RFID นี้ในระบบ",
          text: "กรุณาลงทะเบียนบัตรที่หน้า Master RFID ก่อนใช้งาน",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("checkOperRfid error:", error);
    }
  };

  const handleInputChange = (e, index, column, cleanedValue = null) => {
    try {
      // ถ้าใช้ cleanedValue ก็จะใช้ค่าที่ส่งเข้ามา, ถ้าไม่ใช้จะใช้ค่าจาก e.target
      let value = cleanedValue || e.target.value;
      setRows((prevRows) => {
        // ทำสำเนาของแถวทั้งหมด
        const updatedRows = [...prevRows];

        // ตรวจสอบว่า updatedRows[index] ถูกกำหนดค่าแล้วหรือไม่
        if (!updatedRows[index]) {
          // ถ้าไม่มีก็ให้ตั้งค่าเริ่มต้นให้กับแถวนี้
          updatedRows[index] = {
            prod_date: moment().subtract(1, "days").format("YYYY-MM-DD"),
            shift: "M",
            mc: "",
            part: "",
            pos: "",
            box: "",
            type: "",
            qtyOk: "",
            qtyNg: "",
            rejBy: "",
            caseNg: "",
          };
        }

        // อัปเดตค่าของ column ที่เลือก
        updatedRows[index][column] = value;

        // ถ้าค่า mc เป็นค่าว่าง ให้ reset part
        if (column === "mc" && value === "") {
          updatedRows[index].part = ""; // รีเซ็ตค่า part
        }
        // check Type OK/NG
        if (column === "type" && value === "OK") {
          updatedRows[index].qtyNg = "";
          updatedRows[index].qtyOk = "";
          updatedRows[index].rejBy = "";
          updatedRows[index].caseNg = "";
        }

        // ตรวจสอบว่าแถวนี้มีข้อมูลหรือไม่ ถ้าไม่มีข้อมูลทั้งหมดให้ลบแถวนี้
        const isRowEmpty =
          updatedRows[index].mc === "" &&
          updatedRows[index].part === "" &&
          updatedRows[index].qtyOk === "" &&
          updatedRows[index].qtyNg === "" &&
          updatedRows[index].caseNg === "";
        // ถ้าแถวนี้ไม่มีข้อมูลเลยให้ลบแถว
        if (isRowEmpty && updatedRows.length > 1) {
          updatedRows.splice(index, 1);
        }

        // ตรวจสอบแถวสุดท้าย ถ้ามีข้อมูลครบถ้วน ให้เพิ่มแถวใหม่
        const isLastRowFilled =
          updatedRows[updatedRows.length - 1].mc ||
          updatedRows[updatedRows.length - 1].part ||
          updatedRows[updatedRows.length - 1].qtyOk ||
          updatedRows[updatedRows.length - 1].qtyNg ||
          updatedRows[updatedRows.length - 1].caseNg;

        if (
          isLastRowFilled &&
          updatedRows.length === index + 1 // ถ้าเป็นแถวสุดท้าย
        ) {
          updatedRows.push({
            prod_date: moment().subtract(1, "days").format("YYYY-MM-DD"),
            shift: "M",
            mc: "",
            part: "",
            pos: "",
            box: "",
            type: "",
            qtyOk: "",
            qtyNg: "",
            rejBy: "",
            caseNg: "",
          });
        }

        // ตรวจสอบให้แน่ใจว่ามีแถวแรกที่เป็น default
        if (updatedRows.length === 0) {
          updatedRows.push({
            prod_date: moment().subtract(1, "days").format("YYYY-MM-DD"),
            shift: "M",
            mc: "",
            part: "",
            pos: "",
            box: "",
            type: "",
            qtyOk: "",
            qtyNg: "",
            rejBy: "",
            caseNg: "",
          });
        }
        return updatedRows;
      });
    } catch (error) {
      console.error("Set rows error :: ", error);
    }
  };

  const searchMC = async (mc, index) => {
    if (!mc || mc.length < 4) return;

    setLoading("on");
    try {
      let getMc = await httpClient.post(server.GET_API_MC_TN, { mc_no: mc });

      if (getMc.data.result.data.length > 0) {
        const partNo = getMc.data.result.data[0].partNo;
        const currentProdDate = rows[index]?.prod_date;

        setRows((prevRows) => {
          const updatedRows = [...prevRows];
          if (updatedRows[index]) {
            updatedRows[index].part = partNo;
          }
          return updatedRows;
        });

        searchProd(currentProdDate, mc, partNo);
      } else {
        Swal.fire({
          icon: "warning",
          title: "ไม่พบ M/C นี้",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("SearchMC Error:", error);
    } finally {
      setLoading("off");
    }
  };

  const searchProd = async (prod_date, mc, part) => {
    try {
      let getProd = await httpClient.post(server.GET_API_PROD_TN, {
        prod_date: prod_date,
      });

      if (getProd.data.result.length > 0) {
        getProd.data.result
          .filter((item) => item.machineNo === mc && item.partNo === part)
          .map((item) => item.grandTotalMn);

        setLoading("off");
      } else {
        setLoading("off");
      }
    } catch (error) {
      if (error.code === "NOT_CONNECT_NETWORK") {
        Swal.fire({
          icon: "warning",
          text: "Cannot connect to server, Please try again.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          text: "เกิดข้อผิดพลาดบางอย่าง",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setLoading("off");
      console.error("api prod : ", error);
    }
  };

  const loadingScreen = () => {
    if (loading === "on") {
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

  const handleSave = async () => {
    try {
      let count_date = await httpClient.get(server.GET_REQNO);
      const req = count_date.data.result;

      let newReqNo;

      if (req && req.length > 0) {
        const reqData = req[0].reqno;
        const datePart = moment().format("YYYYMMDD");
        const last3Digits = parseInt(reqData.slice(-3));
        const newLast3Digits = last3Digits + 1;
        // Generate the new reqno
        newReqNo = "REQ-" + datePart + String(newLast3Digits).padStart(3, "0");
      } else {
        const datePart = moment().format("YYYYMMDD");
        newReqNo = "REQ-" + datePart + "001";
      }

      const dataSave = {
        rows,
        oper,
        shifts,
        mfg_date,
        reqno: newReqNo,
      };
      // const checkEmty = rows.some((item) => {
      //   return (item.mc !== "" && item.part !== "") && (item.qty === "" || item.rejBy === "" || item.caseNg === "");
      // });
      // if (checkEmty) {
      //   Swal.fire({
      //     icon: "warning",
      //     text: "กรุณากรอกข้อมูล Qty, Reject, Case NG ให้ครบ!",
      //     timer: 2500,
      //     showConfirmButton: false,
      //   });
      //   return;
      // }

      await httpClient.post(server.IN_VISUAL, dataSave);

      const logSave = await httpClient.post(server.IN_LOG_VISUAL, dataSave);

      if (logSave.data.api_result === "ok") {
        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          showConfirmButton: false,
          timer: 2000,
        });
        window.location.reload();
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  const processBarcode = (value, index) => {
    if (value.length >= 6) {
      const len = value.length;
      const mc_no = value.substring(0, len - 3);
      const shift = value.substring(len - 3, len - 2);
      const box = value.substring(len - 2, len - 1);
      const pos = value.substring(len - 1);

      // อัปเดต State แถว
      updateRowData(index, { mc: mc_no, shift, box, pos });

      // ส่ง mc_no ที่หั่นแล้วไปหาข้อมูลต่อทันที
      searchMC(mc_no, index);

      // Trigger การเพิ่มแถวใหม่
      handleInputChange(null, index, "mc", mc_no);
    } else if (value.length >= 4) {
      searchMC(value, index);
    }
  };
  const updateRowData = (index, newValues) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...newValues } : r))
    );
  };
  const typingTimer = useRef(null);
  return (
    <div className="content-wrapper" id="font-web">
      <div className="card">
        <div className="card-body">
          <h3 className="row justify-content-center">
            <b>FORM VISUAL TURNING</b>
          </h3>
          <div className="row">
            <div className="col-md-auto">
              <b>OPERATOR RFID :</b>
            </div>
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                placeholder="กรุณา Scan RFID"
                value={oper.toUpperCase()}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase().replace(/\s+/g, "");
                  setOper(value);
                  setOperatorName("");

                  if (operTimer.current) clearTimeout(operTimer.current);
                  operTimer.current = setTimeout(() => {
                    checkOperRfid(value);
                  }, 300);
                }}
              />
            </div>

            <div className="col-md-auto">
              <b>SHIFT :</b>
            </div>
            <div className="col-md-1">
              <input
                className="form-control form-control-sm"
                type="text"
                value={shifts}
                disabled
              />
            </div>

            <div className="col-md-auto">
              <b>DATE :</b>
            </div>
            <div className="col-md-auto">
              <input
                className="form-control form-control-sm"
                type="date"
                value={mfg_date}
                disabled
              />
            </div>
          </div>

          <div
            className="row justify-content-center"
            style={{ paddingTop: "10px" }}
          >
            <div className="col-lg-12">
              {loadingScreen()}
              {/* <div
                className="table-responsive p-0"
                style={{ height: "calc(100vh - 200px)" }}
              >
                <table className="table table-bordered"> 
                  <thead>*/}
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
                      <th>M/C NO.</th>
                      <th>PART NO.</th>
                      <th>POS.</th>
                      <th>BOX.</th>
                      <th>TYPE</th>
                      <th>Q'TY OK</th>
                      <th style={{ color: "red" }}>Q'TY NG</th>
                      <th>REJECT BY</th>
                      <th>CASE NG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td style={{ padding: 0, margin: 0 }}>
                          <input
                            type="date"
                            value={row.prod_date}
                            onChange={(e) =>
                              handleInputChange(e, index, "prod_date")
                            }
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <select
                            className="form-select form-control form-control-sm"
                            aria-label="Shift selection"
                            value={row.shift}
                            onChange={(e) =>
                              handleInputChange(e, index, "shift")
                            }
                          >
                            <option value="">เลือก</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="M">M</option>
                            <option value="N">N</option>
                          </select>
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.mc.toUpperCase()}
                            // เพิ่มตัวแปรไว้นอก Component หรือเป็น Ref

                            // ในส่วน onChange
                            onChange={(e) => {
                              let value = e.target.value
                                .toUpperCase()
                                .replace(/\s+/g, "");

                              // 1. อัปเดต UI ทันทีเพื่อให้ User เห็นสิ่งที่พิมพ์/ยิง
                              handleInputChange(e, index, "mc", value);

                              // 2. ล้าง Timer เก่าทิ้งทุกครั้งที่ตัวอักษรใหม่มา
                              if (typingTimer.current)
                                clearTimeout(typingTimer.current);

                              // 3. ตั้งเวลารอ (150ms คือจังหวะที่ยิง Barcode จบพอดี)
                              typingTimer.current = setTimeout(() => {
                                processBarcode(value, index);
                              }, 300);
                            }}
                            // ----------
                            // onChange={(e) => {
                            //   let value = e.target.value
                            //     .toUpperCase()
                            //     .replace(/\s+/g, "");

                            //   // เช็คว่าถ้าความยาวเข้าข่าย Barcode (7 หรือ 8 หลัก)
                            //   if (value.length >= 7) {
                            //     const data = parseBarcode(value);

                            //     updateRowData(index, {
                            //       mc: data.mc,
                            //       shift: data.shift,
                            //       box: data.box,
                            //       pos: data.pos,
                            //     });

                            //     searchMC(data.mc, index);
                            //     handleInputChange(null, index, "mc", data.mc);
                            //   } else {
                            //     // พิมพ์ปกติ
                            //     handleInputChange(e, index, "mc", value);
                            //     if (value.length >= 4) {
                            //       searchMC(value, index);
                            //     }
                            //   }
                            // }}
                          />
                          {/* <input
                          type="text"
                          value={row.mc.toUpperCase()}
                          onChange={(e) => {
                            let value = e.target.value
                              .toUpperCase()
                              .replace(/\s+/g, "");

                            // 1. ถ้า scan มายาวๆ (เช่น 8 หลัก) ให้หั่นและกระจายค่า
                            if (value.length >= 8) {
                              const data = parseBarcode(value);

                              // ฟังก์ชันสำหรับอัปเดต State ทั้งแถว (ส่ง Object เข้าไปแทนค่าเดียว)
                              updateRowData(index, {
                                mc: data.mc,
                                shift: data.shift,
                                box: data.box,
                                pos: data.pos,
                              });

                              // สั่ง Search MC ต่อด้วยค่าที่หั่นแล้ว
                              searchMC(data.mc, index);
                              handleInputChange(null, index, "mc", data.mc);
                            } else {
                              // 2. ถ้าพิมพ์ปกติ หรือยังไม่ครบ format
                              handleInputChange(e, index, "mc", value);
                              if (value.length >= 4) {
                                searchMC(value, index); // ส่งค่า mc และ index เพื่อระบุแถวที่ต้องการอัปเดต
                              }
                            }
                          }}
                          className="form-control form-control-sm"
                        /> */}
                        </td>
                        {/*  */}

                        <td style={{ padding: 0, margin: 0 }}>
                          <input
                            type="text"
                            value={row.part}
                            onChange={(e) =>
                              handleInputChange(e, index, "part")
                            }
                            className="form-control form-control-sm"
                            disabled
                          />
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <select
                            className="form-select form-control form-control-sm"
                            aria-label="pos selection"
                            onChange={(e) => handleInputChange(e, index, "pos")}
                            value={row.pos}
                          >
                            <option value="">เลือก</option>
                            {Array.from({ length: 10 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                            {/* <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option> */}
                          </select>
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <select
                            className="form-select form-control form-control-sm"
                            aria-label="box selection"
                            onChange={(e) => handleInputChange(e, index, "box")}
                            value={row.box}
                          >
                            <option value="">เลือก</option>
                            {Array.from({ length: 10 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <select
                            className="form-select form-control form-control-sm"
                            aria-label="type selection"
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                index,
                                "type",
                                e.target.value
                              )
                            }
                          >
                            <option value="">เลือก</option>
                            <option value="OK">OK</option>
                            <option value="NG">NG</option>
                          </select>
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <input
                            type="number"
                            value={row.qtyOk}
                            onChange={(e) =>
                              handleInputChange(e, index, "qtyOk")
                            }
                            className="form-control form-control-sm"
                            disabled={true} // ถ้า type เป็น NG ให้ disable qtyOk
                          />
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <input
                            type="number"
                            value={row.qtyNg}
                            onChange={(e) =>
                              handleInputChange(e, index, "qtyNg")
                            }
                            className="form-control form-control-sm"
                            disabled={row.type === "OK"}
                          />
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <select
                            className="form-select form-control form-control-sm"
                            aria-label="rejBy selection"
                            onChange={(e) =>
                              handleInputChange(e, index, "rejBy")
                            }
                            disabled={row.type === "OK"}
                          >
                            <option value="">เลือก</option>
                            <option value="Line">Line</option>
                            <option value="Visual">Visual</option>
                            <option value="QC">QC</option>
                          </select>
                        </td>
                        <td style={{ padding: 0, margin: 0 }}>
                          <input
                            type="text"
                            value={row.caseNg}
                            onChange={(e) =>
                              handleInputChange(e, index, "caseNg")
                            }
                            className="form-control form-control-sm"
                            disabled={row.type === "OK"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="row justify-content-center"
                  style={{ paddingTop: 5 }}
                >
                  <div className="col-auto">
                    <button
                      className="btn btn-success"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (oper === "") {
                          Swal.fire({
                            icon: "warning",
                            title: "กรุณา Scan บัตร RFID ของ Operator ให้ถูกต้อง",
                            showConfirmButton: false,
                            timer: 2000,
                          });
                        } else {
                          Swal.fire({
                            title: "คุณต้องการบันทึกข้อมูลใช่หรือไม่?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, save it!",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleSave();
                            }
                          });
                        }
                      }}
                    >
                      Submit
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.reload();
                        // setRows([
                        //   {
                        //     prod_date: moment()
                        //       .subtract(1, "days")
                        //       .format("YYYY-MM-DD"),
                        //     shift: "M",
                        //     mc: "",
                        //     part: "",
                        //     pos: "4",
                        //     box: "1",
                        //     qty: "",
                        //     rejBy: "",
                        //     caseNg: "",
                        //   }, // แถวเริ่มต้น
                        // ]);
                        // setShifts(
                        //   moment().format("HH:mm:ss") >= "07:00" &&
                        //     moment().format("HH:mm:ss") < "18:59"
                        //     ? "M"
                        //     : "N"
                        // );
                        // setMfg_date(moment().format("YYYY-MM-DD"));
                        // setOper("");
                        // setLoading("off");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Input_visual;
