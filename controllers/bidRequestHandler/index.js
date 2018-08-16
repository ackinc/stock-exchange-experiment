const db = require('../../db');
const helpers = require('./helpers');

function bidRequestHandler(req, res) {
    if (!req.body.hasOwnProperty('basebid')) {
        const msg = `Aborting bid as required parameter 'basebid' missing from request body.`;
        res.statusCode = 400;
        res.end(msg);
    } else {
        db.getCompanies({}, (err, companies) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end('Database error');
            } else {
                companies = helpers.baseTargetingCheck(companies, req.body.countrycode, req.body.category);
                if (companies.length === 0) return res.end(`No Companies Passed From Targeting`);

                companies = helpers.budgetCheck(companies);
                if (companies.length === 0) return res.end(`No Companies Passed From Budget`);

                companies = helpers.baseBidCheck(companies, req.body.basebid);
                if (companies.length === 0) return res.end(`No Companies Passed From BaseBid Check`);

                const winner = helpers.chooseWinner(companies);

                db.buyCompanyStock(winner.CompanyID, winner.Bid, (err, success) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end('Database error');
                    } else if (!success) {
                        res.statusCode = 409;
                        res.end(`Another bidder has just exhausted the winning company's budget. Please try again.`);
                    } else {
                        res.end(`Winner: ${winner.CompanyID}`);
                    }
                });
            }
        });
    }
}

module.exports = {
    bidRequestHandler
};
