import React, { Component } from "react";
import PropTypes from "prop-types";

import Client from "../Client";

const baseUrl = "https://courses.students.ubc.ca";

const CourseList = props => {
  const { onDelete, courses, title } = props;

  return (
    <div>
      <h5 className="list-subtitle">{title}</h5>
      <ul className="list">
        {courses.map(({ string, ...rest }, i) => (
          <li key={i}>
            <div className="list-item">
              {string}
              <i
                className="list-deleteIcon fas fa-trash-alt right"
                onClick={() => onDelete({ ...rest })}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

CourseList.propTypes = {
  title: PropTypes.string,
  courses: PropTypes.array,
  onDelete: PropTypes.func
};

const RegisteredList = props => {
  const { courses } = props;
  return (
    <div>
      <h5 className="list-subtitle">Final</h5>
      <ul className="list">
        {courses
          .sort((a, b) => a.course - b.course)
          .map((a, i) => (
            <li key={i}>
              <div className="list-item">
                <a
                  className="link link-hover"
                  onClick={e => (e.target.className += " link-visited")}
                  href={baseUrl + a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >{`${a.subject} ${a.course} ${a.section} ${a.activity}`}</a>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

class SelectedCourses extends Component {
  static defaultProps = {
    courses: [],
    registered: []
  };

  handleDeleteSpecified = ({ subject, course, section, term, activity }) => {
    const { addCourse, courses } = this.props;
    Client.getCourse({ subject, course, term }).then(courseData => {
      const courseObj = JSON.parse(
        JSON.stringify(
          courses.find(a => a.subject === subject && a.course === course)
        )
      );
      courseObj.composition[activity] = courseData.composition[activity];
      addCourse(courseObj);
    });
  };

  handleDeleteGeneral = ({ subject, course, color }) => {
    const { deleteCourse } = this.props;
    deleteCourse({ subject, course, color });
  };

  render() {
    const { courses, registered: registeredCourses, isScheduling } = this.props;
    const specifiedCourses = courses.reduce((acc, { composition }) => {
      Object.keys(composition).forEach(activity => {
        const act = composition[activity];
        if (act.specified) {
          const specifiedSection = act.sections[0];
          const { subject, course, section, term, activity } = specifiedSection;
          const string = `${subject} ${course} ${section} ${activity.slice(
            0,
            3
          )}`;
          acc = acc.concat({
            subject,
            course,
            section,
            activity,
            term,
            string
          });
        }
      });
      return acc;
    }, []);

    const generalCourses = courses.map(
      ({ subject, course, composition, color }) => ({
        subject,
        course,
        color,
        string:
          `${subject} ${course} ` +
          Object.keys(composition).reduce(
            (acc, act, i) => acc + (i === 0 ? "" : ", ") + act.slice(0, 3),
            ""
          )
      })
    );

    return (
      <div className="list-courseList">
        <h4 className="list-title">Course List</h4>
        <div className="list-content">
          {specifiedCourses.length === 0 ? null : (
            <CourseList
              title="Specified"
              courses={specifiedCourses}
              onDelete={this.handleDeleteSpecified}
            />
          )}
          {generalCourses.length === 0 ? null : (
            <CourseList
              title="General"
              courses={generalCourses}
              onDelete={this.handleDeleteGeneral}
            />
          )}
          {registeredCourses.length === 0 || isScheduling ? null : (
            <RegisteredList courses={registeredCourses} />
          )}
        </div>
      </div>
    );
  }
}

SelectedCourses.propTypes = {
  courses: PropTypes.array,
  registered: PropTypes.array,
  deleteCourse: PropTypes.func,
  addCourse: PropTypes.func
};

export default SelectedCourses;
