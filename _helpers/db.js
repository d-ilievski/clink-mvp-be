const config = require("config.json");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

const connectionString = process.env.MONGODB_URI || config.connectionString;

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const client = new MongoClient(connectionString, connectionOptions);

mongoose.Promise = global.Promise;

module.exports = {
  mongooseClient: client,
  Account: require("accounts/account.model"),
  RefreshToken: require("accounts/refresh-token.model"),
  isValidId,
  Profile: require("profile/profile.model"),
  Link: require("profile/link.model"),
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
