function baseTargetingCheck(companies, countrycode, category, log = []) {
    const msgs = [];

    const filtered_companies = companies.filter(c => {
        const passes_country_check = countrycode === undefined || c.Countries.indexOf(countrycode.toUpperCase()) > -1;
        const passes_category_check = category === undefined || c.Categories.indexOf(category.toLowerCase()) > -1;
        const passed = passes_country_check && passes_category_check;

        msgs.push(`{${c.CompanyID} ${passed ? 'passed' : 'failed'}}`);

        return passed;
    });

    log.push(`Base targeting check: ${msgs.join(',')}.`);

    return filtered_companies;
}

function budgetCheck(companies, log = []) {
    const msgs = [];

    const filtered_companies = companies.filter(c => {
        const passed = c.Budget >= c.Bid;

        msgs.push(`{${c.CompanyID} ${passed ? 'passed' : 'failed'}}`);

        return passed;
    });

    log.push(`Budget check: ${msgs.join(',')}.`);

    return filtered_companies;
}

function baseBidCheck(companies, basebid, log = []) {
    const msgs = [];

    filtered_companies = companies.filter(c => {
        const passed = basebid >= c.Bid;

        msgs.push(`{${c.CompanyID} ${passed ? 'passed' : 'failed'}}`);

        return passed;
    });

    log.push(`Base bid check: ${msgs.join(',')}.`);

    return filtered_companies;
}

// selects the company with the highest "Bid" attribute from <companies>
// returns undefined if companies is an empty array
function chooseWinner(companies) {
    return companies.reduce((acc, c) => c.Bid > acc.Bid ? c : acc, companies[0])
}

module.exports = {
    baseBidCheck,
    baseTargetingCheck,
    budgetCheck,
    chooseWinner
}
