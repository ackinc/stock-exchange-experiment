const assert = require('chai').assert;
const request = require('supertest');

const server = require('../index');
const db = require('../db');

// previous database contents will be saved to this variable, and restored after tests have been run
let companies_backup;

// database will be seeded with the following companies before each test
const companies_test = [
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
        "Budget": 20,
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

describe("Integration tests", function () {
    before(done => {
        db.getCompanies({}, (err, res) => {
            companies_backup = res;
            done()
        });
    });

    after(done => {
        if (companies_backup) db.insertCompanies(companies_backup, closeConnections);
        else process.nextTick(closeConnections);

        function closeConnections() {
            db.getDBClient(client => client.close(() => server.close(done)));
        }
    });

    describe('POST /bid - place a bid', () => {
        beforeEach(done => {
            db.insertCompanies(companies_test, done);
        });

        afterEach(done => {
            db.removeCompanies({}, done);
        });

        it('should return a 400 status code if the basebid parameter is missing from request', done => {
            request(server).post('/bid').send({}).end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
        });

        it('should return a JSON response with <success> set to false if no company passes base targeting', done => {
            request(server).post('/bid').send({ basebid: 10, countrycode: "SL" }).end((err, res) => {
                assert.equal(res.status, 200);
                assert.isFalse(res.body.success);
                done();
            });
        });

        it('should return a JSON response with <success> set to false if no company passes budget check', done => {
            request(server).post('/bid').send({ basebid: 30, countrycode: "IN" }).end((err, res) => {
                assert.equal(res.status, 200);
                assert.isFalse(res.body.success);
                done();
            });
        });

        it('should return a JSON response with <success> set to false if no company passes basebid check', done => {
            request(server).post('/bid').send({ basebid: 4, countrycode: "RU" }).end((err, res) => {
                assert.equal(res.status, 200);
                assert.isFalse(res.body.success);
                done();
            });
        });

        it('should return a JSON response with <success> set to true if a company has won the bid', done => {
            request(server).post('/bid').send({ basebid: 50 }).end((err, res) => {
                assert.equal(res.status, 200);
                assert.isTrue(res.body.success);
                assert.equal(res.body.message, 'Winner: C1');
                done();
            });
        });
    });
});
