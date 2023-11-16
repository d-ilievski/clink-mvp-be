const db = require("../helpers/db");

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


// DB Queries

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

module.exports = {
    createLink,
    updateLink,
    deleteLink,
};