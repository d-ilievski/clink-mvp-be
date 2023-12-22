const AccountDetailsModel = require("../models/account-details.model");
const AccountDetailsPrivateDto = require("../dto/account-details-private.dto");

async function getDashboard(accountId) {
  const accountDetails = await AccountDetailsModel.findOne({ account: accountId }, { "connections": { $slice: -5 }, "anonymousConnections": { $slice: -5 } })
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

  return {
    ...new AccountDetailsPrivateDto(accountDetails),
  };
}



module.exports = {
  getDashboard,
};