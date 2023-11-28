class AccountDetailsPrivateDto {

    constructor(data) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.location = data.location;
        this.activeProfile = data.activeProfile;
        this.tags = data.tags;
        this.connections = data.connections;
        this.anonymousConnections = data.anonymousConnections;
        this.links = data.links;
        this.profiles = data.profiles;
    }
}

module.exports = AccountDetailsPrivateDto;