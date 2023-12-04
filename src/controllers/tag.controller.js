const Joi = require('joi');
const tagService = require('../services/tag.service');
const validateRequest = require('../middleware/validate-request');

function getAllTags(req, res, next) {
    tagService.getAllTags(req.user.id)
        .then((response) => res.json(response))
        .catch(next);
}

function getActiveProfileByTag(req, res, next) {
    const accountId = req.user ? req.user.id : null;
    tagService.getActiveProfileByTag(accountId, req.params.connectId)
        .then((response) => res.json(response))
        .catch(next);
}

function claimTagSchema(req, res, next) {
    const schemaRules = {
        connectId: Joi.string().required(),
    };
    const schema = Joi.object(schemaRules);

    validateRequest(req, next, schema);
}
function claimTag(req, res, next) {
    tagService.claimTag(req.user.id, req.body.connectId)
        .then((response) => res.json(response))
        .catch(next);
}

function toggleTagSchema(req, res, next) {
    const schemaRules = {
        id: Joi.string().required(),
        active: Joi.boolean().required(),
    };
    const schema = Joi.object(schemaRules);

    validateRequest(req, next, schema);
}
function toggleTag(req, res, next) {
    tagService.toggleTag(req.user.id, req.body)
        .then((response) => res.json(response))
        .catch(next);
}

module.exports = {
    getAllTags,
    getActiveProfileByTag,
    claimTagSchema,
    claimTag,
    toggleTagSchema,
    toggleTag,
};