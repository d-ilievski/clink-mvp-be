const { secret } = require("config.json");
const db = require("_helpers/db");
const jwt = require("jsonwebtoken");

module.exports = optionallyAuthorize;

function optionallyAuthorize(roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    // optionally authorize based on user role
    async (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      let tokenParsed;
      let account;
      let refreshTokens;
      try {
        tokenParsed = jwt.verify(token, secret, [
          {
            algorithms: ["HS256"],
          },
        ]);
        req.user
          ? (req.user.id = tokenParsed.id)
          : (req.user = { id: tokenParsed.id });

        account = await db.Account.findById(req.user.id);
        refreshTokens = await db.RefreshToken.find({ account: account.id });

        req.user.role = account.role;
        req.user.ownsToken = (token) =>
          !!refreshTokens.find((x) => x.token === token);
      } catch (error) {
        tokenParsed = null;
      }

      next();
    },
  ];
}
