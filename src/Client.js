import Util from "./Util";

const baseUrl = "https://ubc-courses-api.herokuapp.com/";
let cache = {};
let subjectList = [];

const getData = async ({
  subject,
  course,
  section,
  session = "2018W",
  tree
} = {}) => {
  let url = baseUrl;
  tree && (url += "tree/");
  url += session + "/";
  subject && (url += subject.toUpperCase() + "/");
  course && (url += course.toUpperCase() + "/");
  section && (url += section.toUpperCase() + "/");
  try {
    let res = await fetch(url);
    let data = await res.json();
    return data;
  } catch (e) {
    console.log("No response from back end");
    return { error: "No response from back end" };
  }
};

const loadSubjectList = async () => {
  console.log("Loading subject list");
  const data = await getData();
  subjectList = data.error
    ? []
    : data.map(({ code, title }) => ({ code, title }));
};

const getSubjectList = async () => {
  if (subjectList.length === 0) {
    await loadSubjectList();
  }
  return subjectList;
};

const getSubjectOptions = async () => {
  const subjectList = await getSubjectList();
  return subjectList.map(s => ({
    value: s.code,
    label: `${s.code} ${s.title}`,
    isDisabled: true
  }));
};

const removeNoise = courses => {
  Object.keys(courses).forEach(courseNum => {
    const sections = courses[courseNum].sections;
    Object.keys(sections).forEach(secNum => {
      const { start, end, activity } = sections[secNum];
      if (activity === "Waiting List" || activity === "Web-Oriented Course") {
        delete sections[secNum];
      }
      if (start === " " || end === " ") {
        delete sections[secNum];
      }
    });
  });
  return courses;
};

const LoadSubjectCache = async ({ subject }) => {
  console.log("Loading subject cache");
  if (await isValidSubject({ subject })) {
    const data = await getData({ subject, tree: true });
    cache[subject] = removeNoise(data.courses[0]);
  }
};

const isValidSubject = async ({ subject }) => {
  const subjectList = await getSubjectList();
  return subjectList.filter(({ code }) => code === subject).length > 0;
};

const getCourseList = async ({ subject, term } = {}) => {
  if (!(await isValidSubject({ subject }))) {
    return [];
  }
  if (!cache[subject]) {
    await LoadSubjectCache({ subject });
  }
  const subjectCache = cache[subject];
  return Object.keys(subjectCache).filter(courseNum => {
    const sections = subjectCache[courseNum].sections;
    return Object.keys(sections).some(secNum => sections[secNum].term === term);
  });
};

const isValidCourse = async ({ subject, course, term }) => {
  const courseList = await getCourseList({ subject, term });
  return courseList.filter(courseNum => courseNum === course).length > 0;
};

const getCourseOptions = async ({ subject, term }) => {
  const courseList = await getCourseList({ subject, term });
  return courseList.map(courseNum => ({
    value: `${subject} ${courseNum}`,
    label: `${subject} ${courseNum} ${cache[subject][courseNum].course_title}`
  }));
};

const getSectionList = async ({ subject, course, term }) => {
  if (!(await isValidCourse({ subject, course, term }))) {
    return [];
  }
  const sectionsCache = cache[subject][course].sections;
  return Object.keys(sectionsCache).filter(
    secNum => sectionsCache[secNum].term === term
  );
};

const isFull = ({ subject, course, section }) => {
  // const sectionCache = cache[subject][course].sections[section];
  // return sectionCache.totalRemaining === "0";
  return false;
};

const getSectionOptions = async ({ subject, course, term }) => {
  const sectionList = await getSectionList({ subject, course, term });
  if (sectionList.length === 0) return [];
  const sectionsCache = cache[subject][course].sections;
  return sectionList.map(secNum => {
    const isDisabled = isFull({ subject, course, section: secNum });
    return {
      value: `${subject} ${course} ${secNum}`,
      label: `${subject} ${course} ${secNum} ${
        sectionsCache[secNum].activity
      } ${isDisabled ? "[Full]" : ""}`,
      isDisabled
    };
  });
};

const renameField = ({
  subject_code,
  course_number,
  section_number,
  ...rest
}) => {
  let renamed = { ...rest };
  if (subject_code) renamed.subject = subject_code;
  if (course_number) renamed.course = course_number;
  if (section_number) renamed.section = section_number;
  return renamed;
};

const transformField = ({ start, end, ...rest }) => ({
  start: Util.timeStr2Int(start),
  end: Util.timeStr2Int(end),
  bit: Util.toBit(start, end),
  ...rest
});

const preprocessSectionData = ({
  subject_code,
  course_number,
  section_number,
  start,
  end,
  ...rest
}) => ({
  ...rest,
  ...renameField({ subject_code, course_number, section_number }),
  ...transformField({ start, end })
});

const preprocessCourseData = ({
  subject_code,
  course_number,
  section_number,
  ...rest
}) => ({
  ...renameField({ subject_code, course_number, section_number }),
  ...rest
});

const getCourse = async ({ subject, course, term }) => {
  if (!(await isValidCourse({ subject, course, term }))) return null;

  const coursesCache = cache[subject];
  const courseObj = coursesCache[course];
  const sectionsCache = courseObj.sections;

  const sections = Object.keys(sectionsCache)
    .map(secNum => sectionsCache[secNum])
    .filter(s => term === s.term)
    .map(preprocessSectionData);

  const activities = sections
    .map(s => s.activity)
    .filter((activity, i, arr) => arr.indexOf(activity) === i);

  const composition = activities.reduce((acc, val) => {
    acc[val] = {};
    acc[val].sections = sections.filter(({ activity }) => activity === val);
    return acc;
  }, {});

  const { sections: _, ...rest } = courseObj;
  const result = preprocessCourseData({
    ...rest,
    term,
    composition
  });

  return result;
};

const isValidSection = async ({ subject, course, section, term }) => {
  if (!(await isValidCourse({ subject, course, term }))) return false;
  return cache[subject][course].sections[section] === undefined ? false : true;
};

const getSection = async ({ subject, course, section, term }) => {
  if (!(await isValidSection({ subject, course, section, term }))) return null;
  const sectionObj = preprocessSectionData(
    cache[subject][course].sections[section]
  );
  return sectionObj;
};

export default {
  getSubjectOptions,
  getCourseOptions,
  getSectionOptions,
  getSection,
  getCourse
};
