const config = require("../config");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const connectDB = async () => {
  // TODO retry mechanism
  try {
    const connectionOptions = {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || config.connectionString,
      connectionOptions
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  // helpers
  isValidId,
  connectDB,

  // models
  Account: require("src/models/account.model"),
  AccountDetails: require("src/models/account-details.model"),
  Tag: require("src/models/tag.model"),
  Profile: require("src/models/profile.model"),
  Link: require("src/models/link.model"),
  RefreshToken: require("src/models/refresh-token.model"),
};
