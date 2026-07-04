function notFoundHandler(_request, response) {
  response.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

function errorHandler(error, _request, response, _next) {
  const message = error instanceof Error ? error.message : 'Something went wrong';

  response.status(500).json({
    success: false,
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};