const db = require("../helpers/db");

async function getAll() {
    const accounts = await db.Account.find();
    return accounts.map((x) => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (
        params.email &&
        account.email !== params.email &&
        (await db.Account.findOne({ email: params.email }))
    ) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.remove();
}

async function deleteAccount(id) {
    const account = await getAccount(id);

    Promise.all([
        db.AccountDetails.deleteOne({ account: id }),
        db.Profile.deleteOne({ account: id }),
        db.Account.deleteOne({ _id: id }),
    ]);
}



// helper functions

async function getAccount(id) {
    if (!db.isValidId(id)) throw "Account not found";
    const account = await db.Account.findById(id);
    if (!account) throw "Account not found";
    return account;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    deleteAccount,
}