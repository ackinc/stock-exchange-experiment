const db = require('../db');

function bidRequestHandler(req, res) {
    if (req.body.basebid === undefined) {
        res.statusCode = 400;
        res.end(`Required parameter 'basebid' missing from request body`);
    } else {
        db.getCompanies({}, (err, companies) => {
            if (err) {
                res.statusCode = 500;
                res.end('Internal server error');
            } else {
                companies = companies.filter(c => {
                    const passes_country_check = req.body.countrycode === undefined || c.Countries.indexOf(req.body.countrycode.toUpperCase()) > -1;
                    const passes_category_check = req.body.category === undefined || c.Categories.indexOf(req.body.category.toLowerCase()) > -1;
                    return passes_category_check && passes_country_check;
                });
                if (companies.length === 0) return res.end(`No Companies Passed From Targeting`);

                companies = companies.filter(c => c.Budget > 0);
                if (companies.length === 0) return res.end(`No Companies Passed From Budget`);

                companies = companies.filter(c => req.body.basebid >= c.Bid);
                if (companies.length === 0) return res.end(`No Companies Passed From BaseBid Check`);

                const winner = companies.reduce((acc, c) => c.Bid > acc.Bid ? c : acc, companies[0]);
                db.updateCompany(winner.CompanyID, { Budget: winner.Budget - winner.Bid }, err => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Internal server error');
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
