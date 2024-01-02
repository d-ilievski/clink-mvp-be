const Joi = require('joi');
const validateRequest = require("../middleware/validate-request");
const accountDetailsService = require('../services/account-details.service');

function updateAccountDetailsSchema(req, res, next) {
    const schema = Joi.object({
        location: Joi.object({
            country: Joi.string().required(),
            city: Joi.string().required(),
        }),
        firstName: Joi.string(),
        lastName: Joi.string(),
    });
    validateRequest(req, next, schema);
}
function updateAccountDetails(req, res, next) {
    const accountId = req.user ? req.user.id : null;
    accountDetailsService.updateAccountDetails(accountId, req.body)
        .then((response) => res.json(response))
        .catch(next);
}


module.exports = {
    updateAccountDetails,
    updateAccountDetailsSchema,
};