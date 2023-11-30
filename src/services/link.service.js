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

/**
 * Adds a link to a profile.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {Object} params - The parameters for adding the link to the profile.
 * @param {string} params.profileId - The ID of the profile.
 * @param {string} params.linkId - The ID of the link.
 * @returns {Promise<Object>} - The updated profile.
 * @throws {string} - Throws an error if the profile is not found or if the user is unauthorized.
 */
async function addLinkToProfile(accountId, params) {
    if (!db.isValidId(params.profileId)) throw "Profile not found."
    // check if link and profile belong to account
    const link = await LinkModel.findById(params.linkId);
    const profile = await ProfileModel.findById(params.profileId);
    if (profile.account.toString() !== accountId || link.account.toString() !== accountId) {
        throw "Unauthorized";
    }

    // add link to profile
    profile.links.push(link);
    // return updated profile
    return await profile.save();
}

/**
 * Removes a link from a profile.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {object} params - The parameters containing the profile ID and link ID.
 * @returns {Promise<object>} - The updated profile.
 * @throws {string} - Throws an error if the profile is not found, unauthorized, or if the link is not found in the profile.
 */
async function removeLinkFromProfile(accountId, params) {
    if (!db.isValidId(params.profileId)) throw "Profile not found."
    // check if link and profile belong to account
    const link = await LinkModel.findById(params.linkId);
    const profile = await ProfileModel.findById(params.profileId);
    if (profile.account.toString() !== accountId || link.account.toString() !== accountId) {
        throw "Unauthorized";
    }
    // check if link is in profile
    const linkIndex = profile.links.findIndex((l) => l._id.toString() === link._id.toString());
    if (linkIndex === -1) throw "Link not found in profile";

    // remove link from profile
    profile.links.splice(linkIndex, 1);
    // return updated profile
    return await profile.save();
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
    addLinkToProfile,
    removeLinkFromProfile,
};