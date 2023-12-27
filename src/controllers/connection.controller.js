const connectionService = require('../services/connection.service');

function getAllConnections(req, res, next) {
    const accountId = req.user ? req.user.id : null;
    connectionService.getAllConnections(accountId)
        .then((response) => res.json(response))
        .catch(next);
}


module.exports = {
    getAllConnections,
};