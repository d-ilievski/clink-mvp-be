const db = require("../helpers/db");

const LinkModel = require("../models/link.model");

async function createLink(accountId, params) {

    const linkValues = {
        ...params,
        account: accountId,
    };

    const link = new LinkModel(linkValues);
    await link.save();

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

async function getLinkById(id) {
    if (!db.isValidId(id)) throw "Link not found";
    const link = await LinkModel.findById(id);
    if (!link) throw "Link not found";
    return link;
}

module.exports = {
    createLink,
    updateLink,
    deleteLink,
};