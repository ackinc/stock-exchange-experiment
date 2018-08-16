const db = require('../../db');
const helpers = require('./helpers');

function bidRequestHandler(req, res) {
    if (!req.body.hasOwnProperty('basebid')) {
        const msg = `Aborting bid as required parameter 'basebid' missing from request body.`;
        res.json({ success: false, message: msg }, 400);
    } else {
        db.getCompanies({}, (err, companies) => {
            if (err) {
                console.error(err);
                res.json({ success: false, message: 'Database error' }, 500);
            } else {
                companies = helpers.baseTargetingCheck(companies, req.body.countrycode, req.body.category);
                if (companies.length === 0) return res.json({ success: false, message: `No Companies Passed From Targeting` });

                companies = helpers.budgetCheck(companies);
                if (companies.length === 0) return res.json({ success: false, message: `No Companies Passed From Budget` });

                companies = helpers.baseBidCheck(companies, req.body.basebid);
                if (companies.length === 0) return res.json({ success: false, message: `No Companies Passed From BaseBid Check` });

                const winner = helpers.chooseWinner(companies);

                db.buyCompanyStock(winner.CompanyID, winner.Bid, (err, success) => {
                    if (err) {
                        console.error(err);
                        res.json({ success: false, message: 'Database error' }, 500);
                    } else if (!success) {
                        const msg = `Another bidder has just exhausted the winning company's budget. Please bid again.`;
                        res.json({ success: false, message: msg });
                    } else {
                        res.json({ success: true, message: `Winner: ${winner.CompanyID}` });
                    }
                });
            }
        });
    }
}

module.exports = {
    bidRequestHandler
};
