class TagDto {

    constructor(data) {
        this.id = data.id;
        this.active = data.active;
        this.claimDate = data.claimDate;
        this.type = data.type;
    }
}

module.exports = TagDto;