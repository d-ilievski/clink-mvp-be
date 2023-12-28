const ConnectionDto = require("../dto/connection.dto");
const AccountDetailsModel = require("../models/account-details.model");

/**
 * Retrieves all connections for a given account ID.
 *
 * @param {string} accountId - The ID of the account.
 * @returns {Promise<Array<ConnectionDto>>} - A promise that resolves to an array of ConnectionDto objects.
 * @throws {Error} - If an error occurs while retrieving the connections.
 */
async function getAllConnections(accountId) {
    try {
        const accountDetails = await AccountDetailsModel.findOne({ account: accountId })
            .populate({
                path: "connections",
                populate: {
                    path: "profile",
                    populate: 'accountDetails'
                }
            });

        return {
            connections: accountDetails.connections.map(connection => new ConnectionDto(connection)),
            anonymousConnections: accountDetails.anonymousConnections
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllConnections,
};