const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const {
    createLinkSchema,
    createLink,
    updateLinkSchema,
    updateLink,
    deleteLinkSchema,
    deleteLink,
} = require("../controllers/link.controller");

router.post("/", authorize(), createLinkSchema, createLink);
router.put("/", authorize(), updateLinkSchema, updateLink);
router.delete("/", authorize(), deleteLinkSchema, deleteLink);

// TODO create/add link in profile

module.exports = router;