const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const optionallyAuthorize = require("../middleware/optionally-authorize");

const {
    getActiveProfile,
    getPublicProfile,
    getAllProfiles,
    updateProfileSchema,
    updateProfile,
    createProfileSchema,
    createProfile,

    connectProfile,
    downloadContactSchema,
    downloadContact,
} = require("../controllers/profile.controller");

// get active profile
router.get("/", authorize(), getActiveProfile);
// get all personal profiles
router.get("/all", authorize(), getAllProfiles);
// create a profile
router.post("/create", authorize(), createProfileSchema, createProfile);
// edit profile 
router.put("/:id", authorize(), updateProfileSchema, updateProfile);
// get public profile
router.get("/:id", getPublicProfile);


// accepts either logged in user or anonymous user that wants to connect
router.get("/connect/:profileId", optionallyAuthorize(), connectProfile); // optional auth

// save to contacts
router.post("/download-contact", authorize(), downloadContactSchema, downloadContact); // optional auth


module.exports = router;