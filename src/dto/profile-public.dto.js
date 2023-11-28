class ProfilePublicDto {

    #transformData(data) {
        // destructuring
        const { id, type, headline, description, links, profileSettings } = data;

        const activeLinks = links.filter(link => link.active);

        return {
            id,
            type,
            headline: profileSettings.showHeadline ? headline : null,
            description: profileSettings.showDescription ? description : null,
            links: activeLinks,
            profileSettings,
        };
    }

    constructor(data) {

        const { id, type, headline, description, links, profileSettings } = this.#transformData(data);

        // assign
        this.id = id;
        this.type = type;
        this.headline = headline;
        this.description = description;
        this.links = links;
        this.profileSettings = profileSettings;
    }
}

module.exports = ProfilePublicDto;