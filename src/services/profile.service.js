const db = require("../helpers/db");
const LinkType = require("../types/link.type");

const VCard = require('vcard-creator').default;

const AccountDetailsModel = require("../models/account-details.model");
const ProfileModel = require("../models/profile.model");

const ProfilePrivateDto = require("../dto/profile-private.dto");
const AccountDetailsPrivateDto = require("../dto/account-details-private.dto");
const AccountDetailsPublicDto = require("../dto/account-details-public.dto");
const ProfilePublicDto = require("../dto/profile-public.dto");

var object = require('lodash/fp/object');

// Services


/**
 * Retrieves the active profile for a given account ID.
 * 
 * @param {string} accountId - The ID of the account.
 * @returns {Promise<Object>} - The active profile and account details.
 */
async function getActiveProfile(accountId) {
  const accountDetails = await db.AccountDetails.findOne({ account: accountId });
  const profile = await getProfileById(accountDetails.activeProfile);
  return {
    accountDetails: new AccountDetailsPrivateDto(accountDetails),
    ...new ProfilePrivateDto(profile)
  }
}


/**
 * Updates a profile with the given profileId using the provided parameters.
 *
 * @param {string} profileId - The ID of the profile to be updated.
 * @param {object} params - The parameters to update the profile with.
 * @returns {Promise<ProfilePrivateDto>} A promise that resolves to the updated profile.
 */
async function updateProfile(accountId, profileId, params) {
  // prevent editing of other user's profiles
  const accountDetails = await db.AccountDetails.findOne({ account: accountId });
  if (!accountDetails.profiles.some(profile => profile.toString() === profileId)) throw "Something went wrong!";

  const profile = await getProfileById(profileId);

  // copy params to account and save
  object.merge(profile, params);
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
  const accountDetails = await db.AccountDetails.findOne({ account: profile.account.id });

  return {
    accountDetails: new AccountDetailsPublicDto(accountDetails, profile.profileSettings),
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
  // create the profile with the constructed initial values
  const initialValues = {
    account: accountId,
    ...params,
  };
  const profile = new db.Profile(initialValues);
  await profile.save();

  // save the profile in the list of user profiles
  const accountDetails = await db.AccountDetails.findOne({ account: accountId });
  accountDetails.profiles.push(profile.id);
  await accountDetails.save();

  return {
    accountDetails: new AccountDetailsPrivateDto(accountDetails),
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
  const accountDetails = await AccountDetailsModel.findOne({ account: profile.account.id });

  const vCard = new VCard();
  vCard
    .addName(profile.profileSettings.showLastName ? accountDetails.lastName : undefined, accountDetails.firstName)
    .addJobtitle(profile.headline) // check if its not hidden in profile settings first
    .addNote(profile.description) // check if its not hidden in profile settings first

  // TODO: Include links
  // profile.links.forEach(link => {
  //   if (link.active) {

  //     switch (link.platform) {
  //       case LinkType.CustomLink:
  //         vCard.addURL(link.url);
  //         break;

  //       case LinkType.Website:
  //         vCard.addURL(link.url);
  //         break;

  //       case LinkType.Mobile:
  //         vCard.addPhoneNumber(link.url, 'CELL');
  //         break;

  //       case LinkType.BusinessPhone:
  //         vCard.addPhoneNumber(link.url, 'WORK');
  //         break;

  //       case LinkType.PersonalPhone:
  //         vCard.addPhoneNumber(link.url);
  //         break;

  //       default:
  //         vCard.addSocial(link.url, link.platform);
  //         break;
  //     }
  //   }
  // });

  const filename = `${accountDetails.firstName}${profile.profileSettings.showLastName ?
    '_' + accountDetails.lastName : ''}.vcf`;
  return {
    filename,
    vCard: vCard.toString(),
  }
}

// DB Queries

async function getProfileById(id) {
  if (!db.isValidId(id)) throw "Profile not found";
  const profile = await db.Profile.findById(id)
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
  if (!profile) throw "Profile not found";
  return profile;
}

async function getProfileByAccountId(accountId) {
  if (!db.isValidId(accountId)) throw "Profile not found";
  const profile = await ProfileModel.findOne({ account: accountId })
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

  if (!profile) throw "Profile not found";
  return profile;
}

async function getLinkById(id) {
  if (!db.isValidId(id)) throw "Link not found";
  const link = await db.Link.findById(id);
  if (!link) throw "Link not found";
  return link;
}

async function getAccountIdByProfileId(profileId) {
  if (!db.isValidId(profileId)) throw "User not found";
  const profile = await db.Profile.findById(profileId).populate({
    path: "account",
  });

  if (!profile) throw "Account not found";
  return profile.account.id; // id
}

// Transformers
function publicProfile(profile) {
  const { id, account, description, links } = profile;
  const { firstName, lastName, title, handle, location } = account;
  return {
    id,
    description,
    links: links.reduce((reduced, link) => {
      if (link.active) {
        const { active, platform, url, id } = link;
        reduced.push({ active, platform, url, id });
      }
      return reduced;
    }, []),
    account: {
      firstName,
      lastName,
      handle,
      title,
      location,
    },
  };
}

function privateProfile(profile) {
  const { id, account, description, links, connections } = profile;

  const {
    id: accountId,
    title,
    handle,
    location,
    firstName,
    lastName,
    email,
  } = account;

  const connectionsTransformed = connections.map(({ profile, date, id }) => ({
    id,
    accountId: profile.account.id,
    firstName: profile.account.firstName,
    lastName: profile.account.lastName,
    title: profile.title,
    date,
  }));

  return {
    id,
    description,
    links,
    connections: connectionsTransformed,
    account: {
      id: accountId,
      title,
      handle,
      location,
      firstName,
      lastName,
      email,
    },
  };
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