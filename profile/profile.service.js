const db = require("_helpers/db");

module.exports = {
  getPublicByAccountId,
  getByAccountId,
  updateProfile,
  createProfile,
  createLink,
  updateLink,
  deleteLink,
  connectProfile,
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

  const initialValues = {
    account: accountId,
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

async function connectProfile(profileId, requesterUserId) {
  const userId = await getUserIdByProfileId(profileId);

  if (requesterUserId) {
    // match
  }

  return userId;
}

// DB Queries
async function getProfileByAccountId(accountId) {
  if (!db.isValidId(accountId)) throw "Profile not found";
  const profile = await db.Profile.findOne({ account: accountId })
    .populate({
      path: "account",
    })
    .populate({
      path: "links",
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

async function getUserIdByProfileId(profileId) {
  if (!db.isValidId(profileId)) throw "User not found";
  const profile = await db.Profile.findById(profileId);

  if (!profile) throw "Profile not found";
  return profile.account;
}

// async function getProfileById(id) {
//   if (!db.isValidId(id)) throw "Profile not found";
//   const profile = await db.Profile.findById(id);
//   if (!profile) throw "Profile not found";
//   return profile;
// }

// Transformers
function publicProfile(profile) {
  const { id, account, handle, title, description, links } = profile;
  const { firstName, lastName } = account;
  return {
    id,
    handle,
    title,
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
    },
  };
}

function privateProfile(profile) {
  const { id, account, handle, title, description, links } = profile;
  const {
    id: accountId,
    title: userTitle,
    firstName,
    lastName,
    email,
  } = account;
  return {
    id,
    handle,
    title,
    description,
    links,
    account: {
      id: accountId,
      title: userTitle,
      firstName,
      lastName,
      email,
    },
  };
}
