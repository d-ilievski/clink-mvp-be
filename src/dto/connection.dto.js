const ProfilePublicDto = require("./profile-public.dto");

class ConnectionDto {

    constructor(data) {
        this.profile = new ProfilePublicDto(data.profile);
        this.date = data.date;
    }
}

module.exports = ConnectionDto;