const app = require('./app');
const disasterAlertsFeed = require('./worker/disasterAlertsFeed');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  setImmediate(() => disasterAlertsFeed.start());
});

module.exports = server;
