const ProfilePublicDto = require("./profile-public.dto");
const TagDto = require("./tag.dto");
const ConnectionDto = require("./connection.dto");

class AccountDetailsPrivateDto {

    constructor(data) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.location = data.location;
        this.activeProfile = new ProfilePublicDto(data.activeProfile);
        this.tags = data.tags.map(tag => new TagDto(tag));
        this.connections = data.connections.map(connection => new ConnectionDto(connection));
        this.anonymousConnections = data.anonymousConnections;
        this.links = data.links;
        this.profiles = data.profiles.map(profile => new ProfilePublicDto(profile));
        this.totalConnections = data.totalConnections;
        this.totalAnonymousConnections = data.totalAnonymousConnections;
    }
}

module.exports = AccountDetailsPrivateDto;