import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Select from "react-select";
import styled from "styled-components";
import "normalize.css";

import CourseInput from "./CourseInput";
import SelectedCourses from "./SelectedCourses";
import Schedule from "./Schedule";
import WebWorker from "../WebWorker";
import Scheduler from "../Scheduler";
import Colors from "../Colors";
import "../css/style.css";

const Wrapper = styled.div`
  margin-top: 30px;
`;

const termOptions = [
  { value: "1", label: "Term 1" },
  { value: "2", label: "Term 2" }
];

const nOptions = [
  { value: undefined, label: "Unlimited" },
  { value: 20, label: "Max 20" },
  { value: 10, label: "Max 10" }
];

class App extends Component {
  state = {
    courseList: [],
    term: "1",
    isScheduling: false,
    registered: []
  };

  loadSchedule = ({ courseList, terms, n }) => {
    this.setState({ courseList, isScheduling: true });
    this.worker.postMessage({ courseList, terms, n });
  };

  onReceiveSchedule = ({ data: { schedules } }) => {
    const { registered: prevRegistered } = this.state;
    let registered = prevRegistered;
    Object.keys(schedules).forEach(term => {
      registered = registered
        .filter(s => s.term !== term)
        .concat(schedules[term]);
    });
    this.setState({ registered, isScheduling: false });
  };

  addCourse = ({ subject, course, ...rest } = {}) => {
    if (!subject) return;
    const { courseList: prevCourseList, term } = this.state;
    const idx = prevCourseList.findIndex(
      a => a.subject === subject && a.course === course
    );
    let courseList, color, terms;
    if (idx > -1) {
      courseList = JSON.parse(JSON.stringify(this.state.courseList));
      color = courseList[idx].color;
      courseList[idx] = { subject, course, color, ...rest };
      terms = ["1", "2"];
    } else {
      color = this.colors.getColor();
      courseList = prevCourseList.concat({
        subject,
        course,
        color,
        ...rest
      });
      terms = [term];
    }
    this.terminateScheduler();
    this.loadSchedule({ courseList, terms });
  };

  deleteCourse = ({ subject, course, color }) => {
    const { courseList: prevCourseList, term } = this.state;
    const courseList = prevCourseList.filter(
      a => a.subject !== subject || a.course !== course
    );
    this.colors.freeColor(color);
    this.terminateScheduler();
    this.loadSchedule({ courseList, terms: [term] });
  };

  handleTermChange = ({ value }) => {
    this.setState({ term: value });
  };

  handleNChange = ({ value }) => {
    const { courseList, term } = this.state;
    this.terminateScheduler();
    this.loadSchedule({ courseList, terms: [term], n: value });
  };

  terminateScheduler = () => {
    this.worker.terminate();
    this.initScheduler();
    this.setState({ isScheduling: false });
  };

  initScheduler = () => {
    this.worker = new WebWorker(Scheduler);
    this.worker.addEventListener("message", this.onReceiveSchedule);
  };

  componentDidMount() {
    this.initScheduler();
    this.colors = new Colors();
  }

  render() {
    if (window.Worker) {
      const { registered, term, courseList, isScheduling } = this.state;

      console.log(courseList, registered);

      const coloredList = registered
        .filter(s => s.term === term)
        .map(({ subject, course, ...rest }) => {
          const match = courseList.find(
            a => a.subject === subject && a.course === course
          );
          if (!match) return {};
          return {
            color: match.color,
            subject,
            course,
            ...rest
          };
        })
        .filter(
          c => Object.entries(c).length !== 0 || c.constructor !== Object
        );

      return (
        <Wrapper>
          <Grid container justify="center" spacing={16}>
            <Grid item container justify="center" spacing={32} xs={12}>
              <Grid item>
                <Select
                  className="input-n"
                  onChange={this.handleNChange}
                  defaultValue={nOptions[0]}
                  isSearchable={false}
                  placeholder=""
                  options={nOptions}
                />
              </Grid>
              <Grid item>
                <Select
                  className="input-term"
                  onChange={this.handleTermChange}
                  defaultValue={termOptions[0]}
                  isSearchable={false}
                  placeholder=""
                  options={termOptions}
                />
              </Grid>
              <Grid item>
                <CourseInput
                  courses={courseList}
                  addCourse={this.addCourse}
                  updateSection={this.updateSection}
                  term={term}
                />
              </Grid>
            </Grid>
            <Grid item container justify="center" spacing={32}>
              <Grid item>
                <SelectedCourses
                  courses={courseList.filter(a => a.term === term)}
                  registered={registered.filter(a => a.term === term)}
                  isScheduling={isScheduling}
                  deleteCourse={this.deleteCourse}
                  addCourse={this.addCourse}
                />
              </Grid>
              <Grid item>
                <Schedule
                  courses={coloredList}
                  isScheduling={isScheduling}
                  terminateScheduler={this.terminateScheduler}
                />
              </Grid>
            </Grid>
          </Grid>
        </Wrapper>
      );
    } else {
      return (
        <Wrapper>
          <Grid container spacing={16} justify="center">
            <Grid item>Your browser doesn't support web workers.</Grid>
          </Grid>
        </Wrapper>
      );
    }
  }
}

export default App;
