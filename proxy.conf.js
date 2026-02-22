module.exports = {
  '/auth': {
    target: 'https://recipeappbe-production-4692.up.railway.app',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
  },
  '/admin': {
    target: 'https://recipeappbe-production-4692.up.railway.app',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    bypass: function (req) {
      // Browser page navigations accept HTML — let Angular's router handle them
      if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        return '/index.html';
      }
    },
  },
};
