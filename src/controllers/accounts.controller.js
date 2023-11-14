
const Joi = require("joi");
const validateRequest = require("../middleware/validate-request");
const Role = require("../types/role.type");
const accountService = require("../services/account.service");
const { nameRegex } = require("../helpers/validators");

// ==================================================== Authenticate

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  accountService
    .authenticate({ email, password, ipAddress })
    .then(({ refreshToken, ...account }) => {
      setTokenCookie(res, refreshToken);
      res.json(account);
    })
    .catch(next);
}

// ==================================================== Refresh Token

function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  accountService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...account }) => {
      setTokenCookie(res, refreshToken);
      res.json(account);
    })
    .catch(next);
}

// ==================================================== Revoke Token (Logout)

function logoutSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function logout(req, res, next) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  if (!token)
    return res.status(400).json({ message: "Token is required" });

  // users can revoke their own tokens
  if (!req.user.ownsToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  accountService
    .logout({ token, ipAddress })
    .then(() => res.json({ message: "Token revoked" }))
    .catch(next);
}

// ==================================================== Register

function registerSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().regex(nameRegex).required(),
    lastName: Joi.string().regex(nameRegex).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function register(req, res, next) {
  const ipAddress = req.ip;
  accountService
    .register(req.body, req.get("origin"), ipAddress)
    .then(
      ({ refreshToken, ...accountDetails }) => {
        setTokenCookie(res, refreshToken);
        res.json(accountDetails);
      })
    .catch(next);
}

// ==================================================== Verify Email

function verifyEmailSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
  accountService
    .verifyEmail(req.body)
    .then(() =>
      res.json({ message: "Verification successful, you can now login" })
    )
    .catch(next);
}

function forgotPasswordSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
  accountService
    .forgotPassword(req.body, req.get("origin"))
    .then(() =>
      res.json({
        message: "Please check your email for password reset instructions",
      })
    )
    .catch(next);
}

function validateResetTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
  accountService
    .validateResetToken(req.body)
    .then(() => res.json({ message: "Token is valid" }))
    .catch(next);
}

function resetPasswordSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
  accountService
    .resetPassword(req.body)
    .then(() =>
      res.json({ message: "Password reset successful, you can now login" })
    )
    .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
  // create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}

module.exports = {
  authenticateSchema,
  authenticate,
  refreshToken,
  logoutSchema,
  logout,
  registerSchema,
  register,
  verifyEmailSchema,
  verifyEmail,
  forgotPasswordSchema,
  forgotPassword,
  validateResetTokenSchema,
  validateResetToken,
  resetPasswordSchema,
  resetPassword,
};