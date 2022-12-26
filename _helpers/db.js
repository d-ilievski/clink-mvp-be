const config = require("config.json");
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
  connectMongoose: connectDB,
  Account: require("accounts/account.model"),
  RefreshToken: require("accounts/refresh-token.model"),
  isValidId,
  Profile: require("profile/profile.model"),
  Link: require("profile/link.model"),
};
