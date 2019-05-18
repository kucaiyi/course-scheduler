export default () => {
  const late = 22;

  const createWeeklySchedule = sections => {
    let week = {};
    sections.forEach(section => {
      section.days
        .trim()
        .split(" ")
        .forEach(day => {
          if (!week.hasOwnProperty(day)) week[day] = [];
          week[day].push({
            start: section.start,
            end: section.end
          });
        });
    });
    return week;
  };

  const isValidSchedule = sections => {
    let week = {};
    return sections.every(section =>
      section.days
        .trim()
        .split(" ")
        .every(day => {
          if (!week.hasOwnProperty(day)) week[day] = 0;
          if ((week[day] & section.bit) !== 0) return false;
          week[day] = week[day] | section.bit;
          return true;
        })
    );
  };

  const getSchedules = list => {
    return generateAll(
      list.sort((a, b) => a.length - b.length),
      list.length - 1
    );
  };

  const generateAll = (courseList, i) => {
    if (i < 0) return [[]];
    const schedules = generateAll(courseList, i - 1);
    return schedules
      .map(schedule =>
        courseList[i].map(section => {
          const temp = [section].concat(schedule);
          return isValidSchedule(temp) ? temp : [];
        })
      )
      .reduce((acc, list) => acc.concat(list), [])
      .filter(list => list.length > 0);
  };

  const getEarlyBirdSchedule = list => {
    if (list.length === 0) return [];

    let schedules = [];
    let time;
    for (time = 7; time <= late; time += 0.5) {
      // eslint-disable-next-line
      const subList = list.map(c => c.filter(s => s.end <= time));
      schedules = getSchedules(subList);
      if (schedules.length !== 0) break;
    }

    return schedules.length === 0
      ? []
      : schedules[getBestScheduleIdx(schedules, time)];
  };

  const getNightOwlSchedule = list => {
    return [];
  };

  const findBestSchedule = (list, method = "earlybird") => {
    let schedule;
    switch (method) {
      case "earlybird":
      default:
        schedule = getEarlyBirdSchedule(list);
        break;
      case "nightowl":
        schedule = getNightOwlSchedule(list);
        break;
      case "wholedayoff":
        break;
    }

    return schedule;
  };

  const getBestScheduleIdx = (schedules = [], baseLine) => {
    if (schedules.length === 0) return -1;

    const weeks = schedules.map(s => createWeeklySchedule(s));
    let bestValue = Number.MAX_VALUE;
    let bestIdx = 0;
    weeks.forEach((week, i) => {
      const value = Object.keys(week).reduce(
        (acc, day) => acc + evaluateDay(week[day], baseLine),
        0
      );
      if (value < bestValue) {
        bestValue = value;
        bestIdx = i;
      }
    });
    return bestIdx;
  };

  const evaluateDay = (day = [], baseLine, method = "dense") => {
    let value;
    switch (method) {
      case "dense":
        value = day
          .sort((a, b) => a.start - b.start)
          .reduce(
            (acc, _, i) =>
              acc +
              (i === day.length - 1 ? baseLine : day[i + 1].start) -
              day[i].end,
            0
          );
        break;
      case "even":
      default:
        value = Number.MAX_VALUE;
    }
    return value;
  };

  const onReceiveSchedulingRequest = e => {
    if (!e) return;

    const { courseList, terms, n } = e.data;
    let schedules = {};
    terms.forEach(term => {
      const listOfSections = courseList
        .filter(c => c.term === term)
        .map(({ composition }) =>
          Object.keys(composition).map(
            activity => composition[activity].sections
          )
        )
        .reduce((acc, val) => acc.concat(val), []);
      schedules[term] = findBestSchedule(
        listOfSections.map(c => c.slice(0, n))
      );
    });

    postMessage({ schedules });
  };

  // eslint-disable-next-line no-restricted-globals
  self.addEventListener("message", onReceiveSchedulingRequest);
};
