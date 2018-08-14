function andMap(arr, fn) {
    return arr.map(fn).reduce((acc, elem) => !elem ? false : acc, true);
}

module.exports = {
    andMap
};
