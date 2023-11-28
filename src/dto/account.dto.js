class AccountDto {

    constructor(data) {
        this.email = data.email;
        this.verified = data.verified;
        this.role = data.role;
    }
}

module.exports = AccountDto;