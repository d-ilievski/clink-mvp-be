const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const optionallyAuthorize = require("../middleware/optionally-authorize");

const {
    getPublicProfile,
    getAllProfiles,
    getCurrentProfile,
    updateProfileSchema,
    updateProfile,
    connectProfile,
    downloadContactSchema,
    downloadContact,
} = require("../controllers/profile.controller");

// get personal current profile
router.get("/", authorize(), getCurrentProfile);
// edit personal profile 
router.put("/", authorize(), updateProfileSchema, updateProfile);

// get personal profiles
router.get("/all", authorize(), getAllProfiles);

// get public profile
router.get("/:id", getPublicProfile);

// accepts either logged in user or anonymous user that wants to connect
router.get("/connect/:profileId", optionallyAuthorize(), connectProfile); // optional auth

// save to contacts
router.post("/download-contact", authorize(), downloadContactSchema, downloadContact); // optional auth


module.exports = router;