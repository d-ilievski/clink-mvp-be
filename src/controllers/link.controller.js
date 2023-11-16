const Joi = require("joi");
const validateRequest = require("../middleware/validate-request");
const Role = require("../types/role.type");
const linkService = require("../services/link.service");

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

    linkService
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

    linkService
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

    linkService
        .deleteLink(req.user.id, req.body)
        .then((account) => res.json(account))
        .catch(next);
}

module.exports = {
    createLinkSchema,
    createLink,
    updateLinkSchema,
    updateLink,
    deleteLinkSchema,
    deleteLink,
};
