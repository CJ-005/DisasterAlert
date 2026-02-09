const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ alerts: [], message: "Alerts route is working" });
});

module.exports = router;