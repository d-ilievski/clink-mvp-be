

const Joi = require("joi");
const validateRequest = require("../middleware/validate-request");
const Role = require("../types/role.type");
const profileService = require("../services/profile.service");

function getCurrentProfile(req, res, next) {
  profileService
    .getCurrentProfile(req.user.id)
    .then((profile) => (profile ? res.json(profile) : res.sendStatus(404)))
    .catch(next);
}

function getAllProfiles(req, res, next) {
  // profileService
  //   .getAllProfiles(req.user.id)
  //   .then((profile) => (profile ? res.json(profile) : res.sendStatus(404)))
  //   .catch(next);
  return true;
}

function getPublicProfile(req, res, next) {
  profileService
    .getPublicProfile(req.params.id)
    .then((profile) => (profile ? res.json(profile) : res.sendStatus(404)))
    .catch(next);
}

function updateProfileSchema(req, res, next) {
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
  getCurrentProfile,
  getAllProfiles,
  updateProfileSchema,
  updateProfile,
  connectProfile,
  downloadContactSchema,
  downloadContact,
};
