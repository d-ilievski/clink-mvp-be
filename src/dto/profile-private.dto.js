const AccountDetailsPrivateDto = require("./account-details-private.dto");

class ProfilePrivateDto {

    #transformData(data) {
        const payload = {
            id: data?.id || null,
            account: {
                // id: accountId, // might not need this
                email: data?.account?.email,
                role: data?.account?.role,
                isVerified: data?.account?.isVerified,
            },
            type: data?.type || null,
            headline: data?.headline,
            description: data?.description,
            links: data?.links || null,
            profileSettings: data?.profileSettings,
        };

        const accountDetailsDto = data?.accountDetails?.firstName ? new AccountDetailsPrivateDto(data?.accountDetails) : null;

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