const tagService = require('../services/tag.service');

function getCurrentProfileByTag(/*req, res, next*/) {
    tagService.getCurrentProfileByTag();
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
    getCurrentProfileByTag,
    claimTag,
    toggleTag,
};