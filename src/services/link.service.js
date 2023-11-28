const db = require("../helpers/db");

const LinkModel = require("../models/link.model");
const ProfileModel = require("../models/profile.model");


/**
 * Retrieves all links associated with the specified account.
 * 
 * @param {string} accountId - The ID of the account.
 * @returns {Promise<Array>} - A promise that resolves to an array of links.
 */
async function getAllLinks(accountId) {
    return await LinkModel.find({ account: accountId });
}

/**
 * Creates a new link for the specified account.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {object} params - The parameters for creating the link.
 * @returns {Promise<LinkModel>} The newly created link.
 */
async function createLink(accountId, params) {

    const linkValues = {
        ...params,
        account: accountId,
    };

    const link = new LinkModel(linkValues);
    await link.save();

    return link;
}

/**
 * Updates a link.
 *
 * @param {string} accountId - The ID of the account.
 * @param {object} params - The parameters for updating the link.
 * @param {string} params.linkId - The ID of the link to update.
 * @returns {Promise<object>} The updated link.
 * @throws {string} Throws an "Unauthorized" error if the link does not belong to the specified account.
 */
async function updateLink(accountId, params) {
    const link = await getLinkById(params.linkId);
    if (link.account.toString() !== accountId) {
        throw "Unauthorized";
    }

    delete params.linkId;
    link.set(params);
    link.updated = Date.now();

    await link.save();

    return link;
}

/**
 * Deletes a link from the profiles and the link collection.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {object} params - The parameters for deleting the link.
 * @param {string} params.id - The ID of the link to be deleted.
 * @returns {Promise<object>} - A promise that resolves to the delete result.
 * @throws {string} - Throws an error if the link is not deleted.
 */
async function deleteLink(accountId, params) {
    // Remove the link from all profiles
    await ProfileModel.updateMany(
        { account: accountId },
        {
            $pullAll: {
                links: [{ _id: params.id }],
            },
        }
    );

    const deleteResult = await LinkModel.deleteOne({ _id: params.id });

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
    getAllLinks,
    createLink,
    updateLink,
    deleteLink,
};