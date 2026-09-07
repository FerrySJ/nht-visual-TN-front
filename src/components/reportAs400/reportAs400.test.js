import React from "react";
import { shallow } from "enzyme";
import ReportAs400 from "./reportAs400";

describe("ReportAs400", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<ReportAs400 />);
    expect(wrapper).toMatchSnapshot();
  });
});
