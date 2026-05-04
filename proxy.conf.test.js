module.exports = {
  '/auth': {
    target: 'https://recipeappbe-testing.up.railway.app',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
  },
  '/admin': {
    target: 'https://recipeappbe-testing.up.railway.app',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    bypass: function (req) {
      if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        return '/index.html';
      }
    },
  },
};
