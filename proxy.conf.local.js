// `npm run start:local`: proxy /auth and /admin to a backend running on this machine
// (recipe_app_be/api `npm run dev`, port 3000).
module.exports = {
  '/auth': {
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
  '/admin': {
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    bypass: function (req) {
      if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        return '/index.html';
      }
    },
  },
};
