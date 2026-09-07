import React from "react";
import { shallow } from "enzyme";
import Master_rfid from "./master_rfid";

describe("Master_rfid", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Master_rfid />);
    expect(wrapper).toMatchSnapshot();
  });
});
