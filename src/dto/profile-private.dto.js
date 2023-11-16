class ProfilePrivateDto {

    #transformData(data) {
        // destructuring
        const { id, account, accountDetails, type, headline, description, links, profileSettings } = data;

        const {
            id: accountId,
            email,
            role,
            isVerified,
        } = account;

        const {
            firstName,
            lastName,
            location,
        } = accountDetails;

        return {
            id,
            account: {
                id: accountId,
                email,
                role,
                isVerified,
            },
            accountDetails: {
                firstName,
                lastName,
                location,
            },
            type,
            headline,
            description,
            links,
            profileSettings,
        };
    }

    constructor(data) {

        const { id, account, accountDetails, type, headline, description, links, profileSettings } = this.#transformData(data);

        // assign
        this.id = id;
        this.account = {
            id: accountId,
            email: account.email,
            role: account.role,
            isVerified: account.isVerified,
        };
        this.accountDetails = {
            firstName: accountDetails.firstName,
            lastName: accountDetails.lastName,
            location: accountDetails.location,
        };
        this.type = type;
        this.headline = headline;
        this.description = description;
        this.links = links;
        this.profileSettings = profileSettings;
    }
}

module.exports = ProfilePrivateDto;