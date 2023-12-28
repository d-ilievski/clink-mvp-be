const AccountDetailsPublicDto = require("./account-details-public.dto");

class ProfilePublicDto {

    #transformData(data) {
        const activeLinks = data?.links?.filter(link => link.active);

        const payload = {
            id: data?.id || null,
            type: data?.type || null,
            headline: data?.profileSettings?.showHeadline ? data.headline : null,
            description: data?.profileSettings?.showDescription ? data.description : null,
            links: activeLinks || null,
            profileSettings: data?.profileSettings || null,
        };

        const accountDetailsDto = data?.accountDetails?.firstName ? new AccountDetailsPublicDto(data?.accountDetails, data?.profileSettings) : null;

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