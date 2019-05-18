import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Util from "../Util";
import loadingGif from "./loading.gif";

const Image = styled.img`
  opacity: 0.3;
  width: 500px;
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 500px;
  min-height: 650px;
  table-layout: fixed;
  text-align: center;
`;

const THead = styled.thead``;

const TBody = styled.tbody``;

const Row = styled.tr``;

const Cell = styled.td`
  background: ${({ bg }) => bg};
  color: ${({ fg }) => fg};
  border: 1px solid #dddddd;
  padding: 2px;
`;

class Schedule extends Component {
  static defaultProps = {
    courses: []
  };

  timeInt2Str = time => {
    const hour = Math.floor(time).toString();
    let min;
    time % 1 === 0.5 ? (min = "30") : (min = "00");
    return hour + ":" + min;
  };

  getRowSpan = (start, end) => {
    return Math.max((end - start) / 0.5, 0);
  };

  render() {
    let rows = [];
    let flags = [];
    for (let time = Util.early; time <= Util.late; time += 0.5) {
      rows.push({
        time: this.timeInt2Str(time),
        sun: {},
        mon: {},
        tue: {},
        wed: {},
        thu: {},
        fri: {},
        sat: {}
      });
    }

    const { courses: schedule, isScheduling } = this.props;

    if (isScheduling) return <Image src={loadingGif} alt="Loading" />;

    schedule.forEach(sec => {
      let rowIdx = (sec.start - Util.early) * 2;
      const extraSpan = Math.max(this.getRowSpan(sec.start, sec.end) - 1, 0);

      const days = sec.days.split(" ");
      days.forEach(day => {
        for (let i = rowIdx + 1; i < rowIdx + 1 + extraSpan; i++) {
          flags.push({ day: day.toLowerCase(), rowIdx: i });
        }
        switch (day) {
          case "Mon":
            rows[rowIdx].mon = sec;
            break;
          case "Tue":
            rows[rowIdx].tue = sec;
            break;
          case "Wed":
            rows[rowIdx].wed = sec;
            break;
          case "Thu":
            rows[rowIdx].thu = sec;
            break;
          case "Fri":
            rows[rowIdx].fri = sec;
            break;
          case "Sat":
            rows[rowIdx].sat = sec;
            break;
          case "Sun":
            rows[rowIdx].sun = sec;
            break;
          default:
        }
      });
    });

    return (
      <Table>
        <THead>
          <Row>
            <Cell />
            <Cell>Sun</Cell>
            <Cell>Mon</Cell>
            <Cell>Tue</Cell>
            <Cell>Wed</Cell>
            <Cell>Thu</Cell>
            <Cell>Fri</Cell>
            <Cell>Sat</Cell>
          </Row>
        </THead>
        <TBody>
          {rows.map((row, rowIdx) => (
            <Row key={rowIdx}>
              <Cell>{row.time}</Cell>
              {Object.keys(row).map((day, i) => {
                if (
                  day === "time" ||
                  flags.find(flag => flag.day === day && flag.rowIdx === rowIdx)
                ) {
                  return null;
                }
                if (
                  Object.entries(row[day]).length === 0 &&
                  row[day].constructor === Object
                ) {
                  return <Cell key={i} />;
                } else {
                  return (
                    <Cell
                      rowSpan={this.getRowSpan(row[day].start, row[day].end)}
                      key={i}
                      bg={row[day].color.bg}
                      fg={row[day].color.fg}
                    >
                      {row[day].subject +
                        " " +
                        row[day].course +
                        " " +
                        row[day].section}
                    </Cell>
                  );
                }
              })}
            </Row>
          ))}
        </TBody>
      </Table>
    );
  }
}

Schedule.propTypes = {
  courses: PropTypes.array
};

export default Schedule;
