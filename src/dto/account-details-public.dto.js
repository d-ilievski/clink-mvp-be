class AccountDetailsPublicDto {

    constructor(data, profileSettings) {
        this.firstName = data.firstName;
        this.lastName = profileSettings?.showLastName ? data.lastName : null;
        this.location = profileSettings?.showLocation ? data.location : null;
    }
}

module.exports = AccountDetailsPublicDto;