const db = require('./db');

const companies = [
    {
        "CompanyID": "C1",
        "Countries": ["US", "FR"],
        "Budget": 100,
        "Bid": 10,
        "Categories": ["automobile", "finance"]
    },
    {
        "CompanyID": "C2",
        "Countries": ["IN", "US"],
        "Budget": 200,
        "Bid": 30,
        "Categories": ["it", "finance"]
    },
    {
        "CompanyID": "C3",
        "Countries": ["US", "RU"],
        "Budget": 300,
        "Bid": 5,
        "Categories": ["automobile", "it"]
    }
];

db.insertCompanies(companies, () => {
    db.getDBClient(client => client.close(() => console.log('DB seeded with 3 companies')));
});
