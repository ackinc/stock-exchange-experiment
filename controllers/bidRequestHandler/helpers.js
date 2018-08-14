function baseTargetingCheck(companies, countrycode, category) {
    return companies.filter(c => {
        const passes_country_check = countrycode === undefined || c.Countries.indexOf(countrycode.toUpperCase()) > -1;
        const passes_category_check = category === undefined || c.Categories.indexOf(category.toLowerCase()) > -1;
        return passes_category_check && passes_country_check;
    });
}

function budgetCheck(companies) {
    return companies.filter(c => c.Budget > 0);
}

function baseBidCheck(companies, basebid) {
    return companies.filter(c => basebid >= c.Bid);
}

// selects the company with the highest "Bid" attribute from companies
function chooseWinner(companies) {
    return companies.reduce((acc, c) => c.Bid > acc.Bid ? c : acc, companies[0])
}

module.exports = {
    baseBidCheck,
    baseTargetingCheck,
    budgetCheck,
    chooseWinner
}
