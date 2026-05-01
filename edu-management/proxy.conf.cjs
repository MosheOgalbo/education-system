/**
 * Dev proxy: forwards /api → backend. Default 5001 matches docker-compose (API_PUBLISH_PORT).
 * Override: ANGULAR_PROXY_API=http://127.0.0.1:5002 ng serve
 * Avoid host port 5000 on macOS (often AirPlay Receiver).
 */
const target = process.env.ANGULAR_PROXY_API ?? 'http://127.0.0.1:5001';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'silent',
  },
};
