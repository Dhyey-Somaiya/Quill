/**
 * Catch async errors and pass them to the Express next() function.
 * Replaces the need for try/catch blocks in every controller.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
