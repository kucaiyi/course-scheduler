const late = 22;
const early = 7;

const timeStr2Int = time => {
  const array = time.split(":");
  return parseInt(array[0], 10) + parseInt(array[1], 10) / 60;
};

const toBit = (start, end) => {
  let bit = 0;
  const _start = timeStr2Int(start);
  const _end = timeStr2Int(end);
  const length = (_end - _start) / 0.5;
  for (let i = 0; i < length; i++) {
    bit += 1 << Math.max((late - _start) * 2 - 1 - i, 0);
  }
  return bit;
};

export default {
  timeStr2Int,
  toBit,
  late,
  early
};
