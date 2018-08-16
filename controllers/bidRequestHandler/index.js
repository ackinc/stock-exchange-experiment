const db = require('../../db');
const helpers = require('./helpers');

// Request body can have the following parameters:
// basebid - Number | REQUIRED
// countrycode - String
// category - String
function bidRequestHandler(req, res) {
    process.stdout.write(`[${new Date().toUTCString()}] Bid received: ${JSON.stringify(req.body)}.`);

    if (!req.body.hasOwnProperty('basebid')) {
        const msg = `Aborting bid as required parameter 'basebid' missing from request body.`;
        res.json({ success: false, message: msg }, 400);

        process.stdout.write(` ${msg}\n`);
    } else {
        db.getCompanies({}, (err, companies) => {
            if (err) {
                console.error(err);
                res.json({ success: false, message: 'Database error' }, 500);

                process.stdout.write(` Aborted bid due to database error\n`);
            } else {
                companies = helpers.baseTargetingCheck(companies, req.body.countrycode, req.body.category);
                if (companies.length === 0) {
                    res.json({ success: false, message: `No Companies Passed From Targeting` });
                    process.stdout.write(` Bid failed as no companies passed base targeting check.\n`);
                    return;
                }

                companies = helpers.budgetCheck(companies);
                if (companies.length === 0) {
                    res.json({ success: false, message: `No Companies Passed From Budget` });
                    process.stdout.write(` Bid failed as no companies passed budget check.\n`);
                    return;
                }

                companies = helpers.baseBidCheck(companies, req.body.basebid);
                if (companies.length === 0) {
                    res.json({ success: false, message: `No Companies Passed From BaseBid Check` });
                    process.stdout.write(` Bid failed as no companies passed base bid check.\n`);
                    return;
                }

                const winner = helpers.chooseWinner(companies);
                process.stdout.write(` Winning company: ${winner.CompanyID}`);

                db.buyCompanyStock(winner.CompanyID, winner.Bid, (err, success) => {
                    if (err) {
                        console.error(err);
                        res.json({ success: false, message: 'Database error' }, 500);

                        process.stdout.write(` Buying company stock failed due to database error.\n`);
                    } else if (!success) {
                        const msg = `Bid failed as another bidder just exhausted the winning company's budget.`;
                        res.json({ success: false, message: msg });

                        process.stdout.write(` ${msg}\n`);
                    } else {
                        res.json({ success: true, message: `Winner: ${winner.CompanyID}` });

                        process.stdout.write('\n');
                    }
                });
            }
        });
    }
}

module.exports = {
    bidRequestHandler
};
