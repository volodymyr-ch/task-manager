const getBooleanFilter = (field, value) => {
  const stringToBoolean = {
    true: true,
    false: false,
  };

  return Object.keys(stringToBoolean).includes(value)
    ? { [field]: stringToBoolean[value] }
    : null;
};

const getSortByFilter = (value) => {
  if (!value) {
    return null;
  }

  const directions = {
    desc: -1,
    asc: 1,
  };

  const [field = 'createdAt', direction = directions.asc] = value.split(':');

  return { [field]: directions[direction] };
};

module.exports = { getBooleanFilter, getSortByFilter };
