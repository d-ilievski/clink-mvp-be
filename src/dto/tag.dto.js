class TagDto {

    constructor(data) {
        this.active = data.active;
        this.claimDate = data.claimDate;
        this.type = data.type;
    }
}

module.exports = TagDto;