// App_Init
export const APP_INIT = "APP_INIT";
export const APP_TITLE = "REACT web master";

//////////////// Localization Begin ////////////////
export const apiUrl = "http://localhost:2028/"; // <<<<< same back end  >>>>>>
// export const apiUrl = "http://10.120.10.140:3992/"; // server

export const YES = "YES";
export const NO = "NO";
export const OK = "ok";
export const NOK = "nok";

export const server = {
  URL_REGIST: `user/insert`,
  LOGIN_URL: `user/login`,
  
  // visual input
  GET_API_MC_TN: `visual_in/api_get_mc`,
  GET_API_PROD_TN: `visual_in/api_get_prod`,
  IN_VISUAL: `visual_in/in_data_visual`,
  IN_LOG_VISUAL: `visual_in/log_in_data_visual`,
  GET_REQNO: `visual_in/countdate`,
  FIND_VISUAL_ALL: `visual_in/find_req`,
  IN_MASTER_RFID: `register-rfid/inRFID`,
  GET_MASTER_RFID: `register-rfid/inRFID`,

  API_GET_DATA_WIP_STORE_MC_SHOP: `api_getData/getData`,

};
export const key = {
  LOGIN_PASSED: "LOGIN_PASSED",
  USER_LV: "USER_LV",
  TIME_LOGIN: "TIME_LOGIN",
  USER_EMP: "USER_EMP",
  USER_US: "USER_US",
  SECTION: "SECTION",
  PROCESS: "PROCESS",
  TYPE: "TYPE",
  LOCATION: "LOCATION",
};

// Error Code
export const NOT_CONNECT_NETWORK = "NOT_CONNECT_NETWORK";
export const NETWORK_CONNECTION_MESSAGE =
  "Cannot connect to server, Please try again.";
export const NETWORK_TIMEOUT_MESSAGE =
  "A network timeout has occurred, Please try again.";