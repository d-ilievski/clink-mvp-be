const TagModel = require("../models/tag.model");
const AccountDetailsModel = require("../models/account-details.model");
const TagDto = require("../dto/tag.dto");

async function getAllTags(accountId) {
    const accountDetails = await AccountDetailsModel.findOne({ account: accountId }).populate('tags');

    const tags = accountDetails.tags.map((tag) => {
        return new TagDto(tag);
    });

    return tags;
}


/**
 * Retrieves the active profile information based on the provided connectId and user.
 * If the tag is claimed, then the active profile id is returned.
 * Else If the tag is not claimed, then the user's login status is checked.
 * -- If the user is logged in, then the user is taken to claim the tag.
 * -- Else If the user is not logged in, then the user is taken to login/register with the tag.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {string} connectId - The connect ID of the tag.
 * @returns {Promise<Object>} The active profile information.
 * @throws {string} Throws an error if the tag is not found.
 */
async function getActiveProfileByTag(accountId, connectId) {
    const tag = await TagModel.findOne({ connectId });
    if (!tag) {
        throw "Tag not found";
    }

    // check if the tag is claimed
    if (tag.isClaimed) {
        // if the tag is claimed, then get the active profile id that will be used on the frontend to redirect to it
        const accountDetails = await AccountDetailsModel.findOne({ account: tag.account.toString() });
        const activeProfile = accountDetails.activeProfile;
        return {
            claimed: true,
            profileId: activeProfile._id,
            claimTag: false,
        };
    } else {
        // if the tag is not claimed, then check if the user is logged in
        if (accountId) {
            // if the user is logged in, then take them to claim the tag
            return {
                claimed: false,
                claimTag: true,
                profileId: null,
            };
        } else {
            // if the user is not logged in, then take them to login/register with the tag
            return {
                claimed: false,
                claimTag: false,
                profileId: null,
            };
        }
    }
}

/**
 * Claims a tag for a user.
 * 
 * @param {Object} accountId - The user's account id.
 * @param {string} connectId - The connectId of the tag to be claimed.
 * @returns {Promise<Object>} - A promise that resolves to an object with the claimed status, profileId, and claimTag flag.
 * @throws {string} - Throws an error if the tag is not found or already claimed.
 */
async function claimTag(accountId, connectId) {
    const tag = await TagModel.findOne({ connectId });
    if (!tag) {
        throw "Tag not found";
    }
    if (tag.isClaimed) {
        throw "Tag already claimed";
    }

    const accountDetails = await AccountDetailsModel.findOne({ account: accountId });

    tag.account = accountId;
    accountDetails.tags.push(tag);

    tag.updated = Date.now();
    tag.claimDate = Date.now();
    accountDetails.updated = Date.now();


    Promise.all([tag.save(), accountDetails.save()]);

    return {
        claimed: true,
        profileId: accountDetails.activeProfile._id,
        claimTag: false,
    };
}

/**
 * Toggles the active state of a tag.
 * 
 * @param {Object} accountId - The user object.
 * @param {Object} params - The parameters object.
 * @param {string} params.id - The ID of the tag.
 * @param {boolean} params.active - The new active state of the tag.
 * @returns {Promise<Object>} - The updated tag object.
 * @throws {string} - If the tag is not found or the user is unauthorized.
 */
async function toggleTag(accountId, params) {
    const tag = await TagModel.findById(params.id);
    if (!tag) {
        throw "Tag not found";
    }
    // check if the tag belongs to the user
    const accountDetails = await AccountDetailsModel.findOne({ account: accountId });
    if (!accountDetails.tags.includes(tag.id)) {
        throw "Unauthorized";
    }

    tag.active = params.active;
    tag.updated = Date.now();
    await tag.save();

    return new TagDto(tag);
}

module.exports = {
    getAllTags,
    getActiveProfileByTag,
    claimTag,
    toggleTag,
};