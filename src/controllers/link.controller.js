const Joi = require("joi");

const validateRequest = require("../middleware/validate-request");
const Role = require("../types/role.type");

const linkService = require("../services/link.service");

function getAllLinks(req, res, next) {
    linkService
        .getAllLinks(req.user.id)
        .then((response) => res.json(response))
        .catch(next);
}

function createLinkSchema(req, res, next) {
    const schemaRules = {
        type: Joi.string().required(),
        platform: Joi.string().required(),
        value: Joi.string().required(),
        displayName: Joi.string(),
    };

    const schema = Joi.object(schemaRules);

    validateRequest(req, next, schema);
}
function createLink(req, res, next) {
    linkService
        .createLink(req.user.id, req.body)
        .then((response) => res.json(response))
        .catch(next);
}

function updateLinkSchema(req, res, next) {
    const schemaRules = {
        linkId: Joi.string().required(),
        type: Joi.string(),
        platform: Joi.string(),
        value: Joi.string(),
        displayName: Joi.string().allow(""),
    };

    const schema = Joi.object(schemaRules);

    validateRequest(req, next, schema);
}
function updateLink(req, res, next) {
    linkService
        .updateLink(req.user.id, req.body)
        .then((response) => res.json(response))
        .catch(next);
}

function deleteLinkSchema(req, res, next) {
    const schemaRules = {
        linkId: Joi.string().required(),
    };

    const schema = Joi.object(schemaRules);

    validateRequest(req, next, schema);
}
function deleteLink(req, res, next) {
    linkService
        .deleteLink(req.user.id, req.body)
        .then((account) => res.json(account))
        .catch(next);
}

module.exports = {
    getAllLinks,
    createLinkSchema,
    createLink,
    updateLinkSchema,
    updateLink,
    deleteLinkSchema,
    deleteLink,
};
