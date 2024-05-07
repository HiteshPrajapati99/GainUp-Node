export const errorhandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  const responceBody = {
    s: 0,
    m: err.message,
    stack: process.env.NODE_ENV === "production" ? "" : err.stack,
  };

  return res.json(responceBody);
};
