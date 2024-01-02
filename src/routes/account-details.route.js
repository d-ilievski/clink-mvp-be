const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const {
    updateAccountDetails,
    updateAccountDetailsSchema,
} = require("../controllers/account-details.controller");

router.put("/edit", authorize(), updateAccountDetailsSchema, updateAccountDetails);

module.exports = router;
