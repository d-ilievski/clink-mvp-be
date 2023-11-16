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

router.post("/link", authorize(), createLinkSchema, createLink);
router.put("/link", authorize(), updateLinkSchema, updateLink);
router.delete("/link", authorize(), deleteLinkSchema, deleteLink);

module.exports = router;