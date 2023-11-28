const AccountDetails = require("../models/account-details.model");

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

        const accountDetails = new AccountDetails(initialValues);

        await accountDetails.save();

        return accountDetails;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createAccountDetails,
};