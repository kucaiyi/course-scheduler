import React, { Component } from "react";
import AsyncSelect from "react-select/lib/Async";

import Client from "../Client";

class CourseInput extends Component {
  state = {
    input: "",
    value: null
  };

  filterOptions = (inputValue, options) => {
    return options.filter(o =>
      o.value.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  loadOptions = async (inputValue, cb) => {
    const array = inputValue.toUpperCase().split(" ");
    const { term } = this.props;

    if (array.length === 2) {
      const subject = array[0];
      const courseOptions = await Client.getCourseOptions({ subject, term });
      cb(this.filterOptions(inputValue, courseOptions));
    } else if (array.length === 3) {
      const subject = array[0];
      const course = array[1];
      const sectionOptions = await Client.getSectionOptions({
        subject,
        course,
        term
      });
      cb(this.filterOptions(inputValue, sectionOptions));
    } else {
      const subjectOptions = await Client.getSubjectOptions();
      cb(this.filterOptions(inputValue, subjectOptions));
    }
  };

  handleInputChange = (value, { action }) => {
    switch (action) {
      case "input-change":
        this.setState({ input: value.toUpperCase() });
        break;
      default:
        break;
    }
  };

  handleChange = ({ value }, { action }) => {
    switch (action) {
      case "select-option":
        this.addToList(value);
        this.setState({ input: "", value: null });
        break;
      default:
        break;
    }
  };

  addCourse = async ({ subject, course }) => {
    const { addCourse, term, courses } = this.props;
    const match = courses.find(
      a => a.subject === subject && a.course === course && a.term === term
    );
    if (match) return;
    const data = await Client.getCourse({
      subject,
      course,
      term
    });
    addCourse(data);
  };

  addSection = async ({ subject, course, section }) => {
    const { addCourse, courses, term } = this.props;
    const match = courses.find(
      a => a.subject === subject && a.course === course
    );

    let courseData;
    if (match) {
      const composition = match.composition;
      if (
        Object.keys(composition).some(
          activity =>
            composition[activity].specified &&
            composition[activity].sections[0].section === section
        )
      )
        return;
      courseData = JSON.parse(JSON.stringify(match));
    } else {
      courseData = await Client.getCourse({
        subject,
        course,
        term
      });
      if (!courseData) return;
    }
    const sectionData = await Client.getSection({
      subject,
      course,
      section,
      term
    });

    const ref = courseData.composition[sectionData.activity];
    ref.specified = true;
    ref.sections = [sectionData];
    addCourse(courseData);
  };

  addToList = value => {
    const array = value.trim().split(" ");
    if (array.length === 2) {
      this.addCourse({ subject: array[0], course: array[1] });
    } else if (array.length === 3) {
      this.addSection({
        subject: array[0],
        course: array[1],
        section: array[2]
      });
    }
  };

  render() {
    return (
      <AsyncSelect
        className="input-course"
        tabSelectsValue
        inputValue={this.state.input}
        value={this.state.value}
        loadOptions={this.loadOptions}
        placeholder=""
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
      />
    );
  }
}

export default CourseInput;
