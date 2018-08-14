const assert = require('chai').assert;

const helpers = require('./helpers');
const util = require('../../util');

describe(`bidRequestHandler's helper methods`, () => {
    const companies = [
        { CompanyID: "C1", Budget: 100, Bid: 10, Countries: ["US", "FR"], Categories: ["automobile", "it"] },
        { CompanyID: "C2", Budget: 0, Bid: 20, Countries: ["RU", "FR"], Categories: ["finance", "it"] },
        { CompanyID: "C3", Budget: 200, Bid: 30, Countries: ["US", "IN"], Categories: ["automobile", "finance"] }
    ];

    describe('baseTargetingCheck', () => {
        it('should return an empty array when no companies pass base targeting', () => {
            assert.equal(helpers.baseTargetingCheck(companies, "UK", undefined).length, 0);
            assert.equal(helpers.baseTargetingCheck(companies, undefined, "food").length, 0);

            assert.equal(helpers.baseTargetingCheck(companies, "RU", "automobile").length, 0);
        });

        it('should return a non-empty array containing companies that pass base targeting, if they exist', () => {
            let tmp;

            tmp = helpers.baseTargetingCheck(companies, "US", undefined);
            assert.isTrue(tmp.length > 0 &&
                util.andMap(tmp, c => c.Countries.indexOf("US") > -1));

            tmp = helpers.baseTargetingCheck(companies, undefined, "automobile");
            assert.isTrue(tmp.length > 0 &&
                util.andMap(tmp, c => c.Categories.indexOf("automobile") > -1));

            tmp = helpers.baseTargetingCheck(companies, "FR", "automobile");
            assert.isTrue(tmp.length > 0 &&
                util.andMap(tmp, c => c.Countries.indexOf("FR") > -1 && c.Categories.indexOf("automobile") > -1));
        });
    });

    describe('budgetCheck', () => {
        it('should return only those companies with a non-zero budget', () => {
            const tmp = helpers.budgetCheck(companies);
            assert.isTrue(tmp.length === 2 && util.andMap(tmp, c => c.Budget > 0));
        });
    });

    describe('baseBidCheck', () => {
        it('should return an empty array if the bid is too low', () => {
            assert.equal(helpers.baseBidCheck(companies, 5).length, 0);
        });

        it('should return a non-empty array containing companies that can accept the given bid, if they exist', () => {
            const tmp = helpers.baseBidCheck(companies, 25);
            assert.isTrue(tmp.length > 0 && util.andMap(tmp, c => c.Bid <= 25));
        });
    });

    describe('chooseWinner', () => {
        it('should return undefined if provided an empty array', () => {
            assert.isUndefined(helpers.chooseWinner([]));
        });

        it('should return the company with the largest "Bid" value if provided a non-empty array of companies', () => {
            assert.equal(helpers.chooseWinner(companies).CompanyID, 'C3');
        });
    });
});
