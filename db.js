const mongo_client = require('mongodb').MongoClient;

const config = require('./config');

let db;
mongo_client.connect(config.db.url, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    db = client.db(config.db.name);
    console.log(`Connected to database at ${config.db.url}/${config.db.name}`);
});

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

module.exports = { getCompanies, buyCompanyStock, updateCompany, insertCompanies, removeCompanies };
