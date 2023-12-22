const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

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
    connectAnonymousProfileSchema,
    connectAnonymousProfile,
    downloadContactSchema,
    downloadContact,
    setActiveProfileSchema,
    setActiveProfile
} = require("../controllers/profile.controller");

// get active profile
router.get("/private", authorize(), getActiveProfile);
// get public profile
router.get("/public/:id", getPublicProfile);
// get all personal profiles
router.get("/all", authorize(), getAllProfiles);

// create a profile
router.post("/create", authorize(), createProfileSchema, createProfile);
// edit profile 
router.put("/edit", authorize(), updateProfileSchema, updateProfile);

// accepts logged in user that wants to connect
router.post("/connect", authorize(), connectProfileSchema, connectProfile);
// accepts anonymous user that wants to connect (lead)
router.post("/connect-anonymous", connectAnonymousProfileSchema, connectAnonymousProfile);
// save to contacts
router.post("/download-contact", downloadContactSchema, downloadContact);
// set active profile
router.post("/set-active", authorize(), setActiveProfileSchema, setActiveProfile);

module.exports = router;