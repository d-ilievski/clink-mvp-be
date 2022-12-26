const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const Role = require("_helpers/role");
const profileService = require("./profile.service");

const optionallyAuthorize = require("../_middleware/optionallyAuthorize");

// routes
router.get("/:id", getPublicByAccountId);

router.get("/", authorize(), getByAccountId);
router.put("/", authorize(), updateSchema, updateProfile);

router.post("/link", authorize(), createLinkSchema, createLink);
router.put("/link", authorize(), updateLinkSchema, updateLink);
router.delete("/link", authorize(), deleteLinkSchema, deleteLink);

// Will accept a profile id and connect the requester with that profile owner.
// Accessed through scanning the tag, should return the account id of the connection for redirect to the profile
router.get("/connect/:profileId", optionallyAuthorize(), connectProfile); // optional auth

module.exports = router;

// TODO Rename to getPublicProfile
function getPublicByAccountId(req, res, next) {
  profileService
    .getPublicByAccountId(req.params.id)
    .then((profile) => (profile ? res.json(profile) : res.sendStatus(404)))
    .catch(next);
}

// TODO Rename to getPrivateProfile
function getByAccountId(req, res, next) {
  profileService
    .getByAccountId(req.user.id)
    .then((profile) => (profile ? res.json(profile) : res.sendStatus(404)))
    .catch(next);
}

// TODO Rename to updateProfileSchema
function updateSchema(req, res, next) {
  const schemaRules = {
    description: Joi.string().max(220).empty(""),
    links: Joi.array().items(
      Joi.object({
        platform: Joi.string().empty(""),
        url: Joi.string().empty(""),
        description: Joi.string().empty(""),
      })
    ),
  };

  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function updateProfile(req, res, next) {
  // users can update their own account and admins can update any account
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  profileService
    .updateProfile(req.user.id, req.body)
    .then((account) => res.json(account))
    .catch(next);
}

function createLinkSchema(req, res, next) {
  const schemaRules = {
    platform: Joi.string().required(),
    url: Joi.string().required(),
    description: Joi.string().empty(""),
    active: Joi.boolean().default(true),
  };

  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function createLink(req, res, next) {
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  profileService
    .createLink(req.user.id, req.body)
    .then((account) => res.json(account))
    .catch(next);
}

function updateLinkSchema(req, res, next) {
  const schemaRules = {
    id: Joi.string().required(),
    platform: Joi.string().empty(""),
    url: Joi.string().required(),
    active: Joi.boolean(),
  };

  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function updateLink(req, res, next) {
  // users can update their own account and admins can update any account
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  profileService
    .updateLink(req.body)
    .then((link) => res.json(link))
    .catch(next);
}

function deleteLinkSchema(req, res, next) {
  const schemaRules = {
    id: Joi.string().required(),
  };

  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function deleteLink(req, res, next) {
  // users can update their own account and admins can update any account
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  profileService
    .deleteLink(req.user.id, req.body)
    .then((account) => res.json(account))
    .catch(next);
}

function connectProfile(req, res, next) {
  const requesterAccountId = req.user ? req.user.id : undefined;
  profileService
    .connectProfile(req.params.profileId, requesterAccountId)
    .then((connection) =>
      connection ? res.json({ connection }) : res.sendStatus(404)
    )
    .catch(next);
}
