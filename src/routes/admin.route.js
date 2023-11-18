// TODO Admin routes, enable later

const express = require("express");
const router = express.Router();

const Role = require("../types/role.type");
const authorize = require("../middleware/authorize");

const {
    deleteAccount,
} = require("../controllers/admin.controller");


router.get("/delete-account", authorize(Role.Admin), deleteAccount);

// router.get("/", authorize(Role.Admin), getAll);
// router.post("/", authorize(Role.Admin), createSchema, create);

// router.get("/:id", authorize(), getById);
// router.put("/:id", authorize(), updateSchema, update);
// router.delete("/:id", authorize(), _delete);

module.exports = router;