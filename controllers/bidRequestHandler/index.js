const db = require('../../db');
const helpers = require('./helpers');

function bidRequestHandler(req, res) {
    if (!req.body.hasOwnProperty('basebid')) {
        res.statusCode = 400;
        res.end(`Required parameter 'basebid' missing from request body`);
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

                db.updateCompany(winner.CompanyID, { Budget: winner.Budget - winner.Bid }, err => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end('Database error');
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
