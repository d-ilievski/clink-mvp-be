
const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const {
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
} = require("../controllers/accounts.controller");


// routes

router.post("/authenticate", authenticateSchema, authenticate);
router.post("/refresh-token", refreshToken);
router.post("/logout", authorize(), logoutSchema, logout);

router.post("/register", registerSchema, register);
router.post("/verify-email", verifyEmailSchema, verifyEmail);

router.post("/forgot-password", forgotPasswordSchema, forgotPassword);
router.post("/validate-reset-token", validateResetTokenSchema, validateResetToken);
router.post("/reset-password", resetPasswordSchema, resetPassword);

module.exports = router;