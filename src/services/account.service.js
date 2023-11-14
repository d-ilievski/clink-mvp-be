const config = require("../config.local");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../helpers/db");
const Role = require("../types/role.type");

const profileService = require("../services/profile.service");
const { sendVerificationEmail, sendAlreadyRegisteredEmail, sendPasswordResetEmail } = require("./email.service");

const secret = process.env.JWT_SECRET || config.secret;

async function authenticate({ email, password, ipAddress }) {
  const lowercaseEmail = email.toLowerCase();
  const account = await db.Account.findOne({ email: lowercaseEmail });

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

  // save refresh token
  await refreshToken.save();

  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: refreshToken.token,
  };
}

async function refreshToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);
  const { account } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(account, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(account);

  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function register(params, origin, ipAddress) {
  const emailLowercase = params.email.toLowerCase();

  // validate
  if (await db.Account.findOne({ email: emailLowercase })) {
    // send already registered error in email to prevent account enumeration
    sendAlreadyRegisteredEmail(emailLowercase, origin);
    throw `Something happened!`;
  }

  // the whole registration process is wrapped in a try/catch block because of dependency on the profile service
  try {

    // create account object
    const account = new db.Account({
      ...params,
      email: emailLowercase,
    });

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    const profile = await profileService.createProfile(account.id);

    // send email
    sendVerificationEmail(account, origin, profile);

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
      ...basicDetails(account),
      jwtToken,
      refreshToken: refreshToken.token,
    };
  } catch (error) {
    // if anything fails in the registration process, delete the account
    account.remove();

    throw error;
  }

}

async function verifyEmail({ token }) {
  const account = await db.Account.findOne({ verificationToken: token });

  if (!account) throw "Verification failed";

  account.verified = Date.now();
  account.verificationToken = undefined;
  await account.save();
}

async function forgotPassword({ email }, origin) {
  const account = await db.Account.findOne({ email });

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

async function validateResetToken({ token }) {
  const account = await db.Account.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!account) throw "Invalid token";
}

async function resetPassword({ token, password }) {
  const account = await db.Account.findOne({
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
  const refreshToken = await db.RefreshToken.findOne({ token }).populate(
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
  return new db.RefreshToken({
    account: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function basicDetails(account) {
  const {
    id,
    handle,
    title,
    location,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified,
  } = account;
  return {
    id,
    title,
    handle,
    location,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified,
  };
}



module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  // helpers
  basicDetails,
};