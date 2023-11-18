const db = require("../helpers/db");
const LinkType = require("../types/link.type");

const VCard = require('vcard-creator').default;

const ProfileModel = require("../models/profile.model");

const ProfilePrivateDto = require("../dto/profile-private.dto");
const AccountDetailsPrivateDto = require("../dto/account-details-private.dto");

// Services

/**
 * Retrieves a private profile by account ID.
 *
 * @async
 * @function
 * @param {string} id - The account ID to retrieve the profile for.
 * @returns {Promise<ProfilePrivateDto>} A promise that resolves with the private profile DTO.
 */
async function getPrivateProfile(id) {
  const accountDetails = await db.AccountDetails.findOne({ account: id });
  const profile = await getProfileByAccountId(id);
  return {
    accountDetails: new AccountDetailsPrivateDto(accountDetails),
    ...new ProfilePrivateDto(profile)
  }
}

async function getPublicProfile(id) {
  const profile = await getProfileByAccountId(id);
  return publicProfile(profile);
}

async function updateProfile(id, params) {
  const profile = await getProfileByAccountId(id);

  // copy params to account and save
  Object.assign(profile, params);
  profile.updated = Date.now();
  await profile.save();

  return privateProfile(profile);
}

async function createProfile(accountId) {
  // validate
  // if (await db.Account.findById(accountId)) {
  //   throw "Account not found.";
  // }

  const account = await db.Account.findById(accountId);

  if (!account) {
    throw "Account not found.";
  }

  const initialValues = {
    account: account._id,
    handle: "",
    title: "",
    description: "",
  };

  const profile = new db.Profile(initialValues);

  await profile.save();

  return profile;
}

async function connectProfile(profileId, requesterAccountId) {
  const accountId = await getAccountIdByProfileId(profileId);
  let connected = false;

  if (requesterAccountId && requesterAccountId !== accountId) {
    const requesterProfile = await getProfileByAccountId(requesterAccountId);
    const requesterConnecton = requesterProfile.connections.find(
      (connection) => connection.profile.id === profileId
    );

    const userProfile = await getProfileById(profileId);
    const userConnection = userProfile.connections.find(
      (connection) => connection.profile.id === requesterProfile.id
    );

    if (requesterConnecton) {
      // they connected in the past, update date
      requesterConnecton.date = Date.now();
    } else {
      // requester hasn't connected in the past
      requesterProfile.connections.push({ profile: profileId });
    }

    if (userConnection) {
      // they connected in the past, update date
      userConnection.date = Date.now();
    } else {
      // the user hasn't connected in the past
      userProfile.connections.push({ profile: requesterProfile.id });
    }

    await requesterProfile.save();
    await userProfile.save();
    connected = true;
  }

  return {
    accountId,
    requesterAccountId: requesterAccountId || "Guest",
    connected,
  };
}

async function getVCard(accountId, user) {
  const profile = await getProfileByAccountId(accountId);

  const vCard = new VCard();
  vCard
    .addName(profile.account.lastName, profile.account.firstName)
    .addJobtitle(profile.account.title)
    .addNote(profile.description)

  profile.links.forEach(link => {
    if (link.active) {

      switch (link.platform) {
        case LinkType.CustomLink:
          vCard.addURL(link.url);
          break;

        case LinkType.Website:
          vCard.addURL(link.url);
          break;

        case LinkType.Mobile:
          vCard.addPhoneNumber(link.url, 'CELL');
          break;

        case LinkType.BusinessPhone:
          vCard.addPhoneNumber(link.url, 'WORK');
          break;

        case LinkType.PersonalPhone:
          vCard.addPhoneNumber(link.url);
          break;

        default:
          vCard.addSocial(link.url, link.platform);
          break;
      }
    }
  });

  return vCard.toString()
}

// DB Queries

async function getProfileById(id) {
  if (!db.isValidId(id)) throw "Profile not found";
  const profile = await db.Profile.findById(id).populate({
    path: "connections",
    populate: {
      path: "profile",
      model: "Profile",
    },
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
  getPublicProfile,
  getPrivateProfile,
  updateProfile,
  createProfile,
  connectProfile,
  getVCard
};