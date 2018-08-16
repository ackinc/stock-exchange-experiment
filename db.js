const mongo_client = require('mongodb').MongoClient;

const config = require('./config');

let db;
mongo_client.connect(config.db.url, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    db = client.db(config.db.name);
    db.client = client; // keep a reference to the MongoClient instance so we can close the connection later
    console.log(`Connected to database at ${config.db.url}/${config.db.name}`);
});

// 'wraps' fn so that it is re-attempted after a delay (up to n times) if db is not ready
function retryNTimes(fn, n) {
    return function () {
        const args = [].slice.call(arguments);
        if (db) fn.apply(null, args);
        else if (n > 0) setTimeout(() => retryNTimes(fn, n - 1).apply(null, args), 1000);
        else throw new Error('Database connection error');
    }
}

function getDBClient(cb) {
    process.nextTick(() => cb(db.client));
}

function getCompanies(query, cb) {
    db.collection('companies').find(query).toArray(cb);
}

function buyCompanyStock(id, bid, cb) {
    db.collection('companies').findOneAndUpdate(
        { CompanyID: id, Budget: { $gt: 0 } },
        { $inc: { Budget: -bid } },
        (err, res) => {
            if (err) cb(err);
            else cb(null, res.value !== null);
        }
    );
}

function updateCompany(id, new_data, cb) {
    db.collection('companies').updateOne({ CompanyID: id }, { $set: new_data }, cb);
}

function insertCompanies(companies, cb) {
    db.collection('companies').insertMany(companies, cb);
}

function removeCompanies(query, cb) {
    db.collection('companies').deleteMany(query, cb);
}

module.exports = {
    getDBClient: retryNTimes(getDBClient, 5),
    getCompanies: retryNTimes(getCompanies, 5),
    buyCompanyStock: retryNTimes(buyCompanyStock, 5),
    updateCompany: retryNTimes(updateCompany, 5),
    insertCompanies: retryNTimes(insertCompanies, 5),
    removeCompanies: retryNTimes(removeCompanies, 5)
};
