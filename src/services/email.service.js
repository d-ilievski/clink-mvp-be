const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const express = require('express');
const config = require("../config.local");
const viewPath = path.resolve(__dirname, '../templates/views');
const partialsPath = path.resolve(__dirname, '../templates/partials');

async function sendEmail({ to, subject, template, context, from = config.emailFrom }) {

    // use process.env variables in production else use config values
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || config.SMTPHost,
        port: 587,
        auth: {
            user: process.env.SMTP_USERNAME || config.SMTPUsername,
            pass: process.env.SMTP_PASSWORD || config.SMTPPassword,
        },
    });

    transporter.use('compile', hbs({
        viewEngine: {
            extName: '.handlebars',
            layoutsDir: viewPath,
            defaultLayout: false,
            partialsDir: partialsPath,
            express
        },
        viewPath: viewPath,
        extName: '.handlebars',
    }))

    await transporter.sendMail({ from, to, subject, template, context });
}


/**
 * Sends a verification email to the specified account's email address.
 * 
 * @param {Object} account - The account object containing the email address and verification token.
 * @param {Object} accountDetails - The account details object containing the first name of the account owner.
 * @param {string} origin - The origin URL of the application.
 * @returns {Promise<void>} - A Promise that resolves when the email has been sent.
 */
async function sendVerificationEmail(account, accountDetails, origin) {
    if (!origin)
        return;

    await sendEmail({
        to: account.email,
        subject: "Verify your email address - Clink",
        template: 'verification.email',
        context: {
            name: accountDetails.firstName,
            verifyUrl: `${origin}/account/verify?token=${account.verificationToken}`,
        },
    });
}

/**
 * Send an email to the user's email address telling them that they are already registered
 * 
 * @param { String } email The email address of the user
 * @param { String } origin The origin of the request
 */
async function sendAlreadyRegisteredEmail(email, origin) {
    // if (!origin)
    //     return;

    await sendEmail({
        to: email,
        subject: "You are already registered - Clink",
        template: 'already-registered.email',
        context: {
            email,
            forgotPasswordUrl: `${origin}/account/forgot`,
        },
    });
}

/**
 * 
 * @param { Account } account The account to send the password reset email to
 * @param { String } origin The origin of the request
 */
async function sendPasswordResetEmail(account, origin) {
    if (!origin)
        return;

    const resetUrl = `${origin}/account/reset?token=${account.resetToken.token}`;

    await sendEmail({
        to: account.email,
        subject: "Reset Password - Clink",
        template: 'password-reset.email',
        context: {
            resetUrl
        },
    });
}

module.exports = {
    sendVerificationEmail,
    sendAlreadyRegisteredEmail,
    sendPasswordResetEmail,
};