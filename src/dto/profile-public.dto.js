const AccountDetailsPublicDto = require("./account-details-public.dto");

class ProfilePublicDto {

    #transformData(data) {
        // destructuring
        const { id, type, headline, description, links, profileSettings, accountDetails } = data;

        const activeLinks = links?.filter(link => link.active);

        const payload = {
            id,
            type,
            headline: profileSettings.showHeadline ? headline : null,
            description: profileSettings.showDescription ? description : null,
            links: activeLinks,
            profileSettings,
        };

        const accountDetailsDto = accountDetails.firstName ? new AccountDetailsPublicDto(accountDetails) : null;

        if (accountDetailsDto) {
            payload.accountDetails = accountDetailsDto;
        }

        return payload;
    }

    constructor(data) {

        const { id, type, headline, description, links, profileSettings, accountDetails } = this.#transformData(data);

        // assign
        this.id = id;
        this.type = type;
        this.headline = headline;
        this.description = description;
        this.links = links;
        this.profileSettings = profileSettings;
        this.accountDetails = accountDetails;
    }
}

module.exports = ProfilePublicDto;