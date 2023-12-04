const express = require("express");
const router = express.Router();

const authorize = require("../middleware/authorize");
const optionallyAuthorize = require("../middleware/optionally-authorize");

const {
    getActiveProfileByTag,
    claimTagSchema,
    claimTag,
    toggleTag
} = require("../controllers/tag.controller");


// get the current user's profile connected by the tag
// if no profile is connected, then take them to claim the tag
// TODO: Current profile per tag ?
router.get("/:connectId", optionallyAuthorize(), getActiveProfileByTag);

// claim the tag by connect id
router.post("/claim", authorize(), claimTagSchema, claimTag);

// toggle the tag's active status
router.put("/toggle/:id", authorize(), toggleTag);


module.exports = router;