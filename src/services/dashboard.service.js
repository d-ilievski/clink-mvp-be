const AccountDetailsModel = require("../models/account-details.model");
const DashboardDto = require("../dto/dashboard.dto");

async function getDashboard(accountId) {
  const accountDetails = await AccountDetailsModel.findOne({ account: accountId })
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
    ...new DashboardDto(accountDetails),
  };
}



module.exports = {
  getDashboard,
};