﻿const VCard = require('vcard-creator').default;

const db = require("../helpers/db");

const AccountDetailsModel = require("../models/account-details.model");
const ProfileModel = require("../models/profile.model");
const LinkModel = require("../models/link.model");

const ProfilePrivateDto = require("../dto/profile-private.dto");
const ProfilePublicDto = require("../dto/profile-public.dto");

const LinkType = require("../types/link-type.type");
const LinkPlatform = require("../types/link-platform.type");

// Services

/**
 * Retrieves the active profile for a given account ID.
 * 
 * @param {string} accountId - The ID of the account.
 * @returns {Promise<Object>} - The active profile and account details.
 */
async function getActiveProfile(accountId) {
  const accountDetails = await AccountDetailsModel.findOne({ account: accountId })
    .populate({
      path: "activeProfile",
      populate: {
        path: "accountDetails",
      },
    });

  return {
    ...new ProfilePrivateDto(accountDetails.profile)
  }
}



/**
 * Updates a profile for a given account and profileId.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {Object} params - The parameters for updating the profile.
 * @param {string} params.profileId - The ID of the profile to be updated.
 * @returns {Promise<ProfilePrivateDto>} The updated profile.
 * @throws {string} Throws an error if something goes wrong.
 */
async function updateProfile(accountId, params) {
  // prevent editing of other user's profiles
  const accountDetails = await AccountDetailsModel.findOne({ account: accountId });
  if (!accountDetails.profiles.some(profile => profile.toString() === params.profileId)) throw "Unauthorized";

  const profile = await getProfileById(params.profileId);

  // copy params to account and save
  delete params.profileId;
  profile.set(params);
  profile.updated = Date.now();

  await profile.save();

  return new ProfilePrivateDto(profile);
}

/**
 * Retrieves the public profile of a user.
 * 
 * @param {string} profileId - The ID of the profile to retrieve.
 * @returns {Promise<Object>} The public profile object.
 */
async function getPublicProfile(profileId) {
  const profile = await getProfileById(profileId);

  return {
    ...new ProfilePublicDto(profile)
  }
}

/**
 * Retrieves all profiles associated with the given account ID.
 *
 * @param {string} accountId - The ID of the account.
 * @returns {Promise<{ profiles: ProfilePrivateDto[] }>} - An object containing an array of profiles.
 * @throws {string} - Throws an error if the profile is not found.
 */
async function getAllProfiles(accountId) {
  const profiles = await ProfileModel.find({ account: accountId })
    .populate({
      path: "account",
    })
    .populate({
      path: "links",
      populate: {
        path: "link",
      },
    })
    .populate({
      path: "profileSettings",
    });

  if (!profiles || !profiles.length) throw "Profile not found";

  return {
    profiles: profiles.map(profile => new ProfilePrivateDto(profile)),
  }
}

/**
 * Creates a profile for a given account.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {Object} params - The parameters for the profile.
 * @param {string} params.title - The title of the profile (default to empty string).
 * @param {string} params.description - The description of the profile (default to empty string).
 * @returns {Object} - An object containing the account details and the created profile.
 */
async function createProfile(accountId, params = {
  title: "",
  description: "",
}) {
  // check if there's accountDetails available for this account
  const accountDetails = await AccountDetailsModel.findOne({ account: accountId });

  // create the profile with the constructed initial values
  const initialValues = {
    account: accountId,
    accountDetails: accountDetails ? accountDetails.id : null,
    ...params,
  };
  const profile = new ProfileModel(initialValues);
  await profile.save();

  // save the profile in the list of user profiles
  accountDetails.profiles.push(profile.id);
  await accountDetails.save();

  return {
    ...new ProfilePrivateDto(profile),
  };
}

/**
 * Mutually connect requester's default profile with the requested profile.
 * 
 * @param {string} requesterAccountId - The ID of the requester's account.
 * @param {Object} params - The parameters for connecting the profile.
 * @param {string} params.profileId - The ID of the profile to connect.
 * @returns {Promise<Object>} - A promise that resolves to an object indicating the connection status.
 * @throws {string} - Throws an error if attempting to connect to self.
 */
async function connectProfile(requesterAccountId, params) {
  // get requester account details
  const requesterAccountDetails = await AccountDetailsModel.findOne({ account: requesterAccountId });

  // prevent connecting to self
  if (requesterAccountDetails.profiles.some(profile => profile.toString() === params.profileId)) throw "Cannot connect to self";

  // find the profile of the user to connect to
  const requestedProfile = await getProfileById(params.profileId);
  const requestedAccountDetails = await AccountDetailsModel.findOne({ account: requestedProfile.account.id });

  // check if there's a connection already with each side
  const requesterConnection = requesterAccountDetails.connections.find(connection => connection.profile.toString() === params.profileId);
  const requestedConnection = requestedAccountDetails.connections.find(connection => connection.profile.toString() === requesterAccountDetails.activeProfile.toString());
  // if there is, update the dates
  if (requesterConnection && requestedConnection) {
    requesterConnection.date = Date.now();
    requestedConnection.date = Date.now();
  } else {
    if (!requesterConnection) {
      // if there isn't on each side, add the connection
      requesterAccountDetails.connections.push({ profile: params.profileId, date: Date.now() });
    }
    if (!requestedConnection) {
      requestedAccountDetails.connections.push({ profile: requesterAccountDetails.activeProfile, date: Date.now() });
    }
  }

  await requestedAccountDetails.save();
  await requesterAccountDetails.save();

  return {
    connected: true,
  };
}

/**
 * Connects an anonymous profile to a user's account.
 * 
 * @param {Object} params - The parameters for connecting the profile.
 * @param {string} params.profileId - The ID of the profile to connect.
 * @param {string} params.firstName - The first name of the anonymous profile.
 * @param {Array<string>} params.links - The links associated with the anonymous profile.
 * @returns {Promise<Object>} - A promise that resolves to an object indicating the connection status.
 */
async function connectAnonymousProfile(params) {
  // find the profile of the user to connect to
  const requestedProfile = await getProfileById(params.profileId);
  const requestedAccountDetails = await AccountDetailsModel.findOne({ account: requestedProfile.account.id });

  if (!requestedAccountDetails.anonymousConnections) {
    requestedAccountDetails.anonymousConnections = [];
  }
  requestedAccountDetails.anonymousConnections.push({ firstName: params.firstName, links: params.links, date: Date.now() });

  await requestedAccountDetails.save();

  return {
    connected: true,
  };
}

async function downloadContact(profileId) {
  const profile = await getProfileById(profileId);
  if (!profile) throw "Profile not found";
  const links = await LinkModel.find({ account: profile.account.id });

  const vCard = new VCard();
  vCard
    .addName(profile.profileSettings.showLastName ? profile.accountDetails.lastName : undefined, profile.accountDetails.firstName)
    .addJobtitle(profile.headline) // check if its not hidden in profile settings first
    .addNote(profile.description) // check if its not hidden in profile settings first

  links.forEach(link => {
    if (link.active) {

      switch (link.type) {
        case LinkType.Number:
          if ([LinkPlatform.Mobile, LinkPlatform.PersonalPhone].includes(link.platform)) {
            vCard.addPhoneNumber(link.value, 'CELL');
          } else if (LinkPlatform.BusinessPhone) {
            vCard.addPhoneNumber(link.value, 'WORK');
          }
          break;

        case LinkType.Email:
          vCard.addEmail(link.value);
          break;

        case LinkType.Website:
          vCard.addURL(link.value);
          break;

        case LinkType.SocialMedia:
          vCard.addSocial(link.value, link.platform);
          break;

        case LinkType.Other:
          // TODO: Pay special attention to this one
          vCard.addSocial(link.value, link.platform);
          break;

        default:
          break;
      }
    }
  });

  const filename = `${profile.accountDetails.firstName}${profile.profileSettings.showLastName ?
    '_' + profile.accountDetails.lastName : ''}.vcf`;
  return {
    filename,
    vCard: vCard.toString(),
  }
}

// DB Queries

async function getProfileById(id) {
  if (!db.isValidId(id)) throw "Profile not found";
  const profile = await ProfileModel.findById(id)
    .populate({
      path: "account",
    })
    .populate({
      path: "links",
      populate: {
        path: "link",
      },
    })
    .populate({
      path: "profileSettings",
    })
    .populate({
      path: "accountDetails",
    });
  if (!profile) throw "Profile not found";
  return profile;
}


module.exports = {
  getActiveProfile,
  updateProfile,
  getAllProfiles,
  getPublicProfile,
  createProfile,
  connectProfile,
  connectAnonymousProfile,
  downloadContact
};