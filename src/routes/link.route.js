const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const {
    getAllLinks,
    createLinkSchema,
    createLink,
    updateLinkSchema,
    updateLink,
    deleteLinkSchema,
    deleteLink,
    addLinkToProfileSchema,
    addLinkToProfile,
    removeLinkFromProfileSchema,
    removeLinkFromProfile,
} = require("../controllers/link.controller");

router.get("/all", authorize(), getAllLinks);
router.post("/create", authorize(), createLinkSchema, createLink);
router.put("/edit", authorize(), updateLinkSchema, updateLink);
router.delete("/delete", authorize(), deleteLinkSchema, deleteLink);

router.post("/add-to-profile", authorize(), addLinkToProfileSchema, addLinkToProfile);
router.post("/remove-from-profile", authorize(), removeLinkFromProfileSchema, removeLinkFromProfile);

module.exports = router;