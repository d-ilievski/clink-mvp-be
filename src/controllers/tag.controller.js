const Joi = require('joi');
const tagService = require('../services/tag.service');
const validateRequest = require('../middleware/validate-request');

function getActiveProfileByTag(req, res, next) {
    tagService.getActiveProfileByTag(req.params.connectId, req.user)
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
    tagService.claimTag(req.user, req.body.connectId)
        .then((response) => res.json(response))
        .catch(next);
}

function toggleTag(/*req, res, next*/) {
    tagService.toggleTag();
    return true;
}

module.exports = {
    getActiveProfileByTag,
    claimTagSchema,
    claimTag,
    toggleTag,
};