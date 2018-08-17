const db = require('../../db');
const helpers = require('./helpers');

// Request body can have the following parameters:
// basebid - Number | REQUIRED
// countrycode - String
// category - String
function bidRequestHandler(req, res) {
    const log = [];
    log.push(`[${new Date().toUTCString()}] Bid received: ${JSON.stringify(req.body)}.`);

    if (!req.body.hasOwnProperty('basebid')) {
        const msg = `Aborting bid as required parameter 'basebid' missing from request body.`;
        res.json({ success: false, message: msg }, 400);

        log.push(msg);
        process.stdout.write(`${log.join(' ')}\n`);
    } else {
        db.getCompanies({}, (err, companies) => {
            if (err) {
                console.error(err);
                res.json({ success: false, message: 'Database error' }, 500);

                log.push(`Aborted bid due to database error`);
                process.stdout.write(`${log.join(' ')}\n`);
            } else {
                companies = helpers.baseTargetingCheck(companies, req.body.countrycode, req.body.category, log);
                if (companies.length === 0) {
                    res.json({ success: false, message: `No Companies Passed From Targeting` });

                    log.push(`Bid failed as no companies passed base targeting check.`);
                    process.stdout.write(`${log.join(' ')}\n`);
                    return;
                }

                companies = helpers.budgetCheck(companies, log);
                if (companies.length === 0) {
                    res.json({ success: false, message: `No Companies Passed From Budget` });

                    log.push(`Bid failed as no companies passed budget check.`);
                    process.stdout.write(`${log.join(' ')}\n`);
                    return;
                }

                companies = helpers.baseBidCheck(companies, req.body.basebid, log);
                if (companies.length === 0) {
                    res.json({ success: false, message: `No Companies Passed From BaseBid Check` });

                    log.push(`Bid failed as no companies passed base bid check.`);
                    process.stdout.write(`${log.join(' ')}\n`);
                    return;
                }

                const winner = helpers.chooseWinner(companies);
                log.push(`Winning company: ${winner.CompanyID}`);

                db.buyCompanyStock(winner.CompanyID, winner.Bid, (err, success) => {
                    if (err) {
                        console.error(err);
                        res.json({ success: false, message: 'Database error' }, 500);

                        log.push(`Buying company stock failed due to database error.`)
                        process.stdout.write(`${log.join(' ')}\n`);
                    } else if (!success) {
                        const msg = `Bid failed as another bidder just exhausted the winning company's budget.`;
                        res.json({ success: false, message: msg });

                        log.push(msg);
                        process.stdout.write(`${log.join(' ')}\n`);
                    } else {
                        res.json({ success: true, message: `Winner: ${winner.CompanyID}` });

                        log.push(`Stock was bought.`);
                        process.stdout.write(`${log.join(' ')}\n`);
                    }
                });
            }
        });
    }
}

module.exports = {
    bidRequestHandler
};
