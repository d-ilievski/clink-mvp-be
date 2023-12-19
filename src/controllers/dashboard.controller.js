const dashboardService = require('../services/dashboard.service');

function getDashboard(req, res, next) {
    const accountId = req.user ? req.user.id : null;
    dashboardService.getDashboard(accountId)
        .then((response) => res.json(response))
        .catch(next);
}


module.exports = {
    getDashboard,
};