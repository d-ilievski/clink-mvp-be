const TagModel = require("../models/tag.model");
const AccountDetailsModel = require("../models/account-details.model");

/**
 * Retrieves the active profile information based on the provided connectId and user.
 * If the tag is claimed, then the active profile id is returned.
 * Else If the tag is not claimed, then the user's login status is checked.
 * -- If the user is logged in, then the user is taken to claim the tag.
 * -- Else If the user is not logged in, then the user is taken to login/register with the tag.
 * 
 * @param {string} connectId - The connectId to search for.
 * @param {object} user - The user object.
 * @returns {Promise<object>} The active profile information.
 * @throws {string} Throws an error if the tag is not found.
 */
async function getActiveProfileByTag(connectId, user) {
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
        if (user) {
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

async function claimTag(user, connectId) {
    const tag = await TagModel.findOne({ connectId });
    if (!tag) {
        throw "Tag not found";
    }
    if (tag.isClaimed) {
        throw "Tag already claimed";
    }

    const accountDetails = await AccountDetailsModel.findOne({ account: user.id });

    tag.account = user.id;
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

function toggleTag() {
    return true;
}

module.exports = {
    getActiveProfileByTag,
    claimTag,
    toggleTag,
};