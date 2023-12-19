const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const {
    getDashboard,
} = require("../controllers/dashboard.controller");

router.get("", authorize(), getDashboard);

module.exports = router;