const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const optionallyAuthorize = require("../middleware/optionallyAuthorize");

const {
    getPublicByAccountId,
    getByAccountId,
    updateSchema,
    updateProfile,
    createLinkSchema,
    createLink,
    updateLinkSchema,
    updateLink,
    deleteLinkSchema,
    deleteLink,
    connectProfile,
    saveProfileSchema,
    saveProfile,
} = require("../controllers/profile.controller");

router.get("/:id", getPublicByAccountId);

router.get("/", authorize(), getByAccountId);
router.put("/", authorize(), updateSchema, updateProfile);

router.post("/link", authorize(), createLinkSchema, createLink);
router.put("/link", authorize(), updateLinkSchema, updateLink);
router.delete("/link", authorize(), deleteLinkSchema, deleteLink);

// Will accept a profile id and connect the requester with that profile owner.
// Accessed through scanning the tag, should return the account id of the connection for redirect to the profile
router.get("/connect/:profileId", optionallyAuthorize(), connectProfile); // optional auth

router.post("/save", authorize(), saveProfileSchema, saveProfile); // optional auth


module.exports = router;