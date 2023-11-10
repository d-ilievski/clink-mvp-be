const e = require("express");
const db = require("../helpers/db");
const LinkType = require("../types/LinkType");

const VCard = require('vcard-creator').default;

module.exports = {
  getPublicByAccountId,
  getByAccountId,
  updateProfile,
  createProfile,
  createLink,
  updateLink,
  deleteLink,
  connectProfile,
  getVCard
};

// Services

async function getPublicByAccountId(id) {
  const profile = await getProfileByAccountId(id);
  return publicProfile(profile);
}

async function getByAccountId(id) {
  const profile = await getProfileByAccountId(id);
  return privateProfile(profile);
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

async function createLink(accountId, params) {
  const profile = await getProfileByAccountId(accountId);

  const linkValues = {
    ...params,
    profile: profile.id,
  };

  const link = new db.Link(linkValues);
  await link.save();

  profile.links.push(link.id);
  await profile.save();

  return link;
}

async function updateLink(params) {
  const link = await getLinkById(params.id);

  // copy params to account and save
  Object.assign(link, params);
  link.updated = Date.now();
  await link.save();

  return link;
}

async function deleteLink(accountId, params) {
  await db.Profile.updateOne(
    { account: accountId },
    {
      $pullAll: {
        links: [{ _id: params.id }],
      },
    }
  );

  const deleteResult = await db.Link.deleteOne({ _id: params.id });

  if (!deleteResult.ok) {
    throw "Link not deleted";
  }

  return deleteResult;
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
  const profile = await db.Profile.findOne({ account: accountId })
    .populate({
      path: "account",
    })
    .populate({
      path: "links",
    })
    .populate({
      path: "connections",
      populate: {
        path: "profile",
        model: "Profile",
        populate: {
          path: "account",
          model: "Account",
        },
      },
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
