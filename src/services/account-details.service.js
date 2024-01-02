const AccountDetailsModel = require("../models/account-details.model");
const AccountDetailsPrivateDto = require("../dto/account-details-private.dto");

/**
 * Creates an account details object for the given account and profile.
 * 
 * @param {Object} account - The account object.
 * @param {Object} params - The parameters object.
 * @param {string} params.firstName - The first name of the account holder.
 * @param {string} params.lastName - The last name of the account holder.
 * @returns {Promise<Object>} - The created account details object.
 * @throws {string} - If the account is not found or an error occurs while creating the account details object.
 */
async function createAccountDetails(account, params) {

    if (!account) {
        throw "Account not found.";
    }

    try {
        const initialValues = {
            account: account._id,
            firstName: params.firstName,
            lastName: params.lastName,
            profiles: [],
            activeProfile: null,
        };

        const accountDetails = new AccountDetailsModel(initialValues);

        await accountDetails.save();

        return accountDetails;
    } catch (error) {
        throw error;
    }
}

/**
 * Updates the active profile for a given account.
 * Used in profile controller.
 * 
 * @param {string} accountId - The ID of the account.
 * @param {object} params - The parameters for updating the active profile.
 * @param {string} params.profileId - The ID of the profile to set as active.
 * @returns {Promise<AccountDetailsPrivateDto>} The updated account details with the active profile.
 * @throws {string} If the user is unauthorized to update the active profile.
 */
async function updateActiveProfile(accountId, params) {

    try {
        const accountDetails = await AccountDetailsModel.findOne({ account: accountId }, { "connections": { $slice: -5 }, "anonymousConnections": { $slice: -5 } });

        if (!accountDetails.profiles.some(profile => profile.toString() === params.profileId)) {
            throw "Unauthorized.";
        }

        accountDetails.activeProfile = params.profileId;

        await accountDetails.save();

        await accountDetails
            .populate("activeProfile")
            .populate("profiles")
            .populate("tags")
            .populate({
                path: "connections",
                populate: {
                    path: "profile",
                    populate: 'accountDetails'
                }
            })
            .populate({ path: "anonymousConnections" })
            .execPopulate();

        return new AccountDetailsPrivateDto(accountDetails);
    } catch (error) {
        throw error;
    }
}

async function updateAccountDetails(accountId, params) {

    try {
        const accountDetails = await AccountDetailsModel.findOne({ account: accountId }, { "connections": { $slice: -5 }, "anonymousConnections": { $slice: -5 } });

        if (params.firstName) accountDetails.firstName = params.firstName;
        if (params.lastName) accountDetails.lastName = params.lastName;
        if (params.location) accountDetails.location = params.location;

        await accountDetails.save();

        await accountDetails
            .populate("activeProfile")
            .populate("profiles")
            .populate("tags")
            .populate({
                path: "connections",
                populate: {
                    path: "profile",
                    populate: 'accountDetails'
                }
            })
            .populate({ path: "anonymousConnections" })
            .execPopulate();

        return new AccountDetailsPrivateDto(accountDetails);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createAccountDetails,
    updateActiveProfile,
    updateAccountDetails,
};