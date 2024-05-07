export const checkValueExist = (req, requiredValues) => {
  const need = [];
  const body = req.body ? Object.keys(req.body) : [];
  const query = req.query ? Object.keys(req.query) : [];

  const allValues = body.concat(query);

  requiredValues.forEach((value) => {
    if (
      !allValues.includes(value) ||
      !req.body[value] ||
      req.body[value].trim() === ""
    ) {
      need.push(value);
    }
  });

  if (need.length > 0) {
    return "Required : " + need.join(", ");
  }
};
