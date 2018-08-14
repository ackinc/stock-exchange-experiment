const assert = require('chai').assert

const util = require('.');

describe('Util function tests', () => {
    describe('andMap', () => {
        const andMap = util.andMap;

        it('should return true when provided an empty array', () => {
            assert.isTrue(andMap([], function () { return true; }));
        });

        it('should return true when all values in the intermediate array are true', () => {
            assert.isTrue(andMap([2, 4, 6], function () { return true; }));
            assert.isTrue(andMap([2, 4, 6], function (x) { return x % 2 === 0; }));
        });

        it('should return false when at least one value in the intermediate array is false', () => {
            assert.isFalse(andMap([2, 4, 6], function () { return false; }));
            assert.isFalse(andMap([2, 4, 5], function (x) { return x % 2 === 0; }));
        });
    });
});
