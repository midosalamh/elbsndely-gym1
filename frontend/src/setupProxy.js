const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'https://22njky-5000.csb.app',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error:', err);
      },
      pathRewrite: {
        '^/api': '/api', // Keep /api prefix
      },
    })
  );
};
