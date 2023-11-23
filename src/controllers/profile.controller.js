

const Joi = require("joi");
const validateRequest = require("../middleware/validate-request");
const profileService = require("../services/profile.service");

function getActiveProfile(req, res, next) {
  profileService
    .getActiveProfile(req.user.id)
    .then((profile) => (profile ? res.json(profile) : res.sendStatus(404)))
    .catch(next);
}

function updateProfileSchema(req, res, next) {
  const schemaRules = {
    headline: Joi.string().max(120).allow(""),
    description: Joi.string().max(240).allow(""),
    links: Joi.array().items(
      Joi.object({
        link: Joi.string().required(),
        active: Joi.boolean(),
      })
    ),
    profileSettings: Joi.object({
      showHeadline: Joi.boolean(),
      showDescription: Joi.boolean(),
      showLastName: Joi.boolean(),
      showLocation: Joi.boolean(),
      showSaveToContacts: Joi.boolean(),
    }),
  };
  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function updateProfile(req, res, next) {

  profileService
    .updateProfile(req.params.id, req.body)
    .then((response) => res.json(response))
    .catch(next);
}

function getPublicProfile(req, res, next) {
  profileService
    .getPublicProfile(req.params.id)
    .then((response) => (response ? res.json(response) : res.sendStatus(404)))
    .catch(next);
}

function getAllProfiles(req, res, next) {
  profileService
    .getAllProfiles(req.user.id)
    .then((response) => (response.profiles.length ? res.json(response) : res.sendStatus(404)))
    .catch(next);
  return true;
}

function createProfileSchema(req, res, next) {
  const schemaRules = {
    headline: Joi.string().max(120).allow(""),
    description: Joi.string().max(240).allow(""),
  };
  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function createProfile(req, res, next) {
  profileService
    .createProfile(req.user.id, req.body)
    .then((response) => (response ? res.json(response) : res.sendStatus(404)))
    .catch(next);
  return true;
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

function downloadContactSchema(req, res, next) {
  const schemaRules = {
    accountId: Joi.string().required(),
  };

  const schema = Joi.object(schemaRules);

  validateRequest(req, next, schema);
}
function downloadContact(req, res, next) {
  profileService
    .getVCard(req.body.accountId, req.user)
    .then((vcard) =>
      vcard ? res.status(200).attachment('contact.vcf').send(vcard) : res.sendStatus(404)
    )
    .catch(next);
}

module.exports = {
  getPublicProfile,
  getActiveProfile,
  getAllProfiles,
  updateProfileSchema,
  updateProfile,
  createProfileSchema,
  createProfile,
  connectProfile,
  downloadContactSchema,
  downloadContact,
};
