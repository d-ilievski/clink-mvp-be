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
    connectProfileSchema,
    connectProfile,

    connectAnonymousProfile,
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
// accepts logged in user that wants to connect
router.post("/connect", authorize(), connectProfileSchema, connectProfile); // optional auth

// accepts anonymous user that wants to connect (lead)
router.post("/connect-anonymous", connectAnonymousProfile); // optional auth
// save to contacts
router.post("/download-contact", authorize(), downloadContactSchema, downloadContact); // optional auth


module.exports = router;