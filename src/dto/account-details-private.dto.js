const ProfilePublicDto = require("./profile-public.dto");
const TagDto = require("./tag.dto");
const ConnectionDto = require("./connection.dto");

class AccountDetailsPrivateDto {

    constructor(data) {
        if (!data) {
            return;
        }
        this.firstName = data?.firstName || null;
        this.lastName = data?.lastName || null;
        this.location = data?.location || null;
        this.activeProfile = new ProfilePublicDto(data.activeProfile);
        this.tags = data.tags?.map(tag => new TagDto(tag)) || null;
        this.connections = data?.connections?.map(connection => new ConnectionDto(connection)) || null;
        this.anonymousConnections = data?.anonymousConnections;
        this.links = data?.links || null;
        this.profiles = data?.profiles?.map(profile => new ProfilePublicDto(profile)) || null;
        this.totalConnections = data?.totalConnections || null;
        this.totalAnonymousConnections = data?.totalAnonymousConnections || null;
    }
}

module.exports = AccountDetailsPrivateDto;