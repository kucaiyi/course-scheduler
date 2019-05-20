# [termly.ca](http://termly.ca) - a UBC course scheduler

## pain relievers
- the app picks an optimal section from each activity (e.g. labs, tutorials, discussions and lectures) of a course
- the app removes a course in one term when the user selects the same course in the other term

## steps
1. select a term
2. select either a course or a specific section from the dropdown list
3. (*optional if scheduling takes too long*) use the left most button to limit the number of sections per course
    - e.g. CPSC 121, CPSC 110, ENGL 112 and CPSC 310
4. (*optional*) all of the following actions will trigger re-scheduling:
    - add/remove a course/section
    - change the number of sections per course
5. repeat step 1 to 4
6. follow the generated links to register courses

### known issues
- adding courses in one term when the app is scheduling courses for the other term leads to a schedule inconsistent with the course list

## api
the app uses https://ubc-courses-api.herokuapp.com for fetching subject/course/section data.


**many thanks** to [@qstevens](https://github.com/qstevens) for making this api!

## scheduling
### preprocessing (optimization)
- convert time intervals of sections to binary representions (helps detect section conflicts in O(1) time)
- sort courses by the number of sections in an increasing order (cut the computation tree early when a conflict is detected)

### looping through recursion
scheduling process might terminate early when sections are evenly distributed over 7 am to 10 pm
```javascript
for (time = 7; time <= late; time += 0.5) {
  // sped up the scheduling process by reducing the number of sections per course
  const subList = list.map(c => c.filter(s => s.end <= time)); 
  schedules = getSchedules(subList);
  if (schedules.length !== 0) break;
}
```

### schedule evaluation
1. sections end as early as possible
2. sections as close to each other as possible

## upcoming
- include 2-term courses
- filter out sections with no remaining seats in real-time
- add option to include waitlist
- add more schedule evaluation methods
