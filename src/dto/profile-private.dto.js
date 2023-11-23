class ProfilePrivateDto {

    #transformData(data) {
        // destructuring
        const { id, account, type, headline, description, links, profileSettings } = data;

        const {
            // id: accountId,
            email,
            role,
            isVerified,
        } = account;

        return {
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
    }

    constructor(data) {

        const { id, account, type, headline, description, links, profileSettings } = this.#transformData(data);

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
    }
}

module.exports = ProfilePrivateDto;