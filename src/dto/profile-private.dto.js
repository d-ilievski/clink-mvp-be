const AccountDetailsPrivateDto = require("./account-details-private.dto");

class ProfilePrivateDto {

    #transformData(data) {
        // destructuring
        const { id, account, type, headline, description, links, profileSettings, accountDetails } = data;



        const {
            // id: accountId,
            email,
            role,
            isVerified,
        } = account;

        const payload = {
            id,
            account: {
                // id: accountId, // might not need this
                email,
                role,
                isVerified,
            },
            type,
            headline,
            description,
            links,
            profileSettings,
        };

        const accountDetailsDto = accountDetails.firstName ? new AccountDetailsPrivateDto(accountDetails) : null;

        if (accountDetailsDto) {
            payload.accountDetails = accountDetailsDto;
        }

        return payload;
    }

    constructor(data) {

        const { id, account, type, headline, description, links, profileSettings, accountDetails } = this.#transformData(data);

        // assign
        this.id = id;
        this.account = {
            id: account.id,
            email: account.email,
            role: account.role,
            isVerified: account.isVerified,
        };
        this.type = type;
        this.headline = headline;
        this.description = description;
        this.links = links;
        this.profileSettings = profileSettings;
        this.accountDetails = accountDetails;
    }
}

module.exports = ProfilePrivateDto;