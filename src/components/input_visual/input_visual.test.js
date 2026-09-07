import React from "react";
import { shallow } from "enzyme";
import Input_visual from "./input_visual";

describe("Input_visual", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Input_visual />);
    expect(wrapper).toMatchSnapshot();
  });
});
