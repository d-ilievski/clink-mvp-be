const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const {
    getAllConnections,
} = require("../controllers/connection.controller");

router.get("/all", authorize(), getAllConnections);

module.exports = router;