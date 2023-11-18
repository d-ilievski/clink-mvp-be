
const config = require("../config.local");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Role = require("../types/role.type");

const AccountDetailsModel = require("../models/account-details.model");
const AccountModel = require("../models/account.model");
const RefreshTokenModel = require("../models/refresh-token.model");

const profileService = require("../services/profile.service");
const accountDetailsService = require("../services/account-details.service");
const { sendVerificationEmail, sendAlreadyRegisteredEmail, sendPasswordResetEmail } = require("./email.service");
const AccountDetailsPrivateDto = require("../dto/account-details-private.dto");
const AccountDto = require("../dto/account.dto");

const secret = process.env.JWT_SECRET || config.secret;


/**
 * Authenticates a user with their email and password.
 * @async
 * @function
 * @param {Object} params - The authentication parameters.
 * @param {string} params.email - The user's email.
 * @param {string} params.password - The user's password.
 * @param {string} params.ipAddress - The user's IP address.
 * @returns {Promise<Object>} An object containing the user's basic details, JWT token, and refresh token.
 * @throws {string} Throws an error if the email or password is incorrect.
 */
async function authenticate({ email, password, ipAddress }) {
  const lowercaseEmail = email.toLowerCase();
  const account = await AccountModel.findOne({ email: lowercaseEmail });

  if (
    !account ||
    // !account.isVerified ||
    !bcrypt.compareSync(password, account.passwordHash)
  ) {
    throw "Email or password is incorrect";
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(account);
  const refreshToken = generateRefreshToken(account, ipAddress);

  const accountDetails =
    await AccountDetailsModel.findById(account.accountDetails)
      .populate("profile")
      .populate({
        path: "profiles",
        select: "type",
      })
      .populate("tags")
      .populate("connections")

  // return basic details and tokens
  return {
    ...new AccountDto(account),
    accountDetails: new AccountDetailsPrivateDto(accountDetails),
    jwtToken,
    refreshToken: refreshToken.token,
  };
}


/**
 * Generates a new JWT token and refresh token for the given user's refresh token.
 * Called when a user's JWT token almost expires or when a user starts the app again.
 * @async
 * @function refreshToken
 * @param {Object} options - The options object.
 * @param {string} options.token - The user's refresh token.
 * @param {string} options.ipAddress - The IP address of the user.
 * @returns {Promise<Object>} An object containing the user's basic details, a new JWT token, and a new refresh token.
 */
async function refreshToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);
  const { account } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(account, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(account);

  // return basic details and tokens
  return {
    ...new AccountDto(account),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
}


/**
 * Logs out a user by revoking their refresh token.
 * The token's validity gets checked with it's virtual `isActive` property.
 * @async
 * @function logout
 * @param {Object} options - The options object.
 * @param {string} options.token - The user's JWT token.
 * @param {string} options.ipAddress - The IP address of the user.
 * @returns {Promise<void>}
 */
async function logout({ token, ipAddress }) {
  // find the refresh token from the db and check if it's active
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

/**
 * Registers a new account with the provided parameters.
 * 
 * @param {Object} params - The account registration parameters.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.password - The password of the user.
 * @param {string} origin - The origin of the request.
 * @param {string} ipAddress - The IP address of the user.
 * @returns {Promise<Object>} - An object containing the account details and tokens.
 * @throws {string} - Throws an error if something goes wrong during the registration process.
 */
async function register(params, origin, ipAddress) {
  const emailLowercase = params.email.toLowerCase();

  // validate
  if (await AccountModel.findOne({ email: emailLowercase })) {
    // send already registered error in email to prevent account enumeration
    sendAlreadyRegisteredEmail(emailLowercase, origin);
    throw `Something happened!`;
  }

  // the whole registration process is wrapped in a try/catch block because of dependency on the profile service
  try {
    // create account object
    const account = new AccountModel({
      email: emailLowercase,
    });
    // first registered account is an admin
    const isFirstAccount = (await AccountModel.countDocuments({})) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    // random verification token
    account.verificationToken = randomTokenString();
    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    // create profile and add it to the account details
    const profile = await profileService.createProfile(account.id);

    // create account details
    const accountDetails = await accountDetailsService.createAccountDetails(account, profile, params);
    account.accountDetails = accountDetails.id; // set account details id to the account for easier querying
    accountDetails.populate("profile");

    // save account
    await account.save();

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // send verification email
    sendVerificationEmail(account, accountDetails, origin);

    // return basic details and tokens
    return {
      ...new AccountDto(account),
      accountDetails: new AccountDetailsPrivateDto(accountDetails),
      jwtToken,
      refreshToken: refreshToken.token,
    };

  } catch (error) {

    // if anything fails in the registration process, delete the account and the profile
    if (account) account.remove();
    if (accountDetails) accountDetails.remove();
    if (profile) profile.remove();

    throw error;
  }

}


/**
 * Verifies the email of an account using a verification token.
 * 
 * @async
 * @function
 * @param {Object} options - The options object.
 * @param {string} options.token - The verification token.
 * @throws {string} Throws an error if verification fails.
 * @returns {Promise<void>} A Promise that resolves when the email is verified.
 */
async function verifyEmail({ token }) {
  const account = await AccountModel.findOne({ verificationToken: token });

  if (!account) throw "Verification failed";

  account.verified = Date.now();
  account.verificationToken = undefined;
  await account.save();
}


/**
 * Sends a password reset email to the user with the given email address.
 * 
 * @param {Object} param - The email address of the user to send the password reset email to.
 * @param {string} param.email - The email address of the user to send the password reset email to.
 * @param {string} origin - The origin of the request.
 */
async function forgotPassword({ email }, origin) {
  const account = await AccountModel.findOne({ email });

  // always return ok response to prevent email enumeration
  if (!account) return;

  // create reset token that expires after 24 hours
  account.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  await account.save();

  // send email
  await sendPasswordResetEmail(account, origin);
}

/**
 * Validates a reset token for an account.
 * 
 * @async
 * @function
 * @param {Object} options - The options object.
 * @param {string} options.token - The reset token to validate.
 * @throws {string} Throws an error if the token is invalid.
 */
async function validateResetToken({ token }) {
  const account = await AccountModel.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!account) throw "Invalid token";
}


/**
 * Resets the password for an account using a reset token.
 * 
 * @async
 * @function
 * @param {Object} options - The options object.
 * @param {string} options.token - The reset token.
 * @param {string} options.password - The new password.
 * @throws {string} Invalid token
 * @returns {Promise<void>} A Promise that resolves when the password has been reset.
 */
async function resetPassword({ token, password }) {
  const account = await AccountModel.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!account) throw "Invalid token";

  // update password and remove reset token
  account.passwordHash = hash(password);
  account.passwordReset = Date.now();
  account.resetToken = undefined;
  await account.save();
}

// helper functions

async function getRefreshToken(token) {
  const refreshToken = await RefreshTokenModel.findOne({ token }).populate(
    "account"
  );
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account) {
  // create a jwt token containing the account id that expires in 15 minutes
  return jwt.sign({ sub: account.id, id: account.id }, secret, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(account, ipAddress) {
  // create a refresh token that expires in 7 days
  const refreshToken = new RefreshTokenModel({
    account: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
  refreshToken.save();

  return refreshToken;
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

module.exports = {
  authenticate,
  refreshToken,
  logout,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
};