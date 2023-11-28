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
} = require("../controllers/link.controller");

router.get("/all", authorize(), getAllLinks);
router.post("/create", authorize(), createLinkSchema, createLink);
router.put("/edit", authorize(), updateLinkSchema, updateLink);
router.delete("/delete", authorize(), deleteLinkSchema, deleteLink);

// TODO create/add link in profile

module.exports = router;