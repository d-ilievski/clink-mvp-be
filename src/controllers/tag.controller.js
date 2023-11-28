const tagService = require('../services/tag.service');

function getActiveProfileByTag(/*req, res, next*/) {
    tagService.getActiveProfileByTag();
    return true;
}

function claimTag(/*req, res, next*/) {
    tagService.claimTag();
    return true;
}

function toggleTag(/*req, res, next*/) {
    tagService.toggleTag();
    return true;
}

module.exports = {
    getActiveProfileByTag,
    claimTag,
    toggleTag,
};