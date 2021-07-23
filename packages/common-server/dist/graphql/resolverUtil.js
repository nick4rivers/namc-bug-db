"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExclusiveFilter = exports.createPagination = exports.limitOffsetCheck = exports.loggedInGate = void 0;
var common_1 = require("@namcbugdb/common");
var config_1 = require("../config");
var lodash_1 = require("lodash");
function loggedInGate(user) {
    var err = new Error('You must be authenticated to perform this query.');
    try {
        if (!user.cognito.isLoggedIn || !user.cognito.sub || user.cognito.sub.length < 10)
            throw err;
    }
    catch (_a) {
        throw new Error('You are not authorized to perform this query.');
    }
}
exports.loggedInGate = loggedInGate;
function limitOffsetCheck(limit, limitMax, offset) {
    if (!limit)
        throw new Error('You must provide a limit for this query');
    if (limit < 0)
        throw new Error('limit must be a valid positive integer');
    if (limit > limitMax)
        throw new Error("limit for this query has a maximum value of " + limitMax);
    if (!(offset >= 0))
        throw new Error('Offset must be a positive integer');
}
exports.limitOffsetCheck = limitOffsetCheck;
function createPagination(data, limit, offset) {
    var nextOffset = null;
    try {
        nextOffset = data && data.length === limit ? offset + limit : null;
    }
    catch (_a) { }
    return {
        records: data.map(function (record) { return common_1.util.snake2camel(record); }),
        nextOffset: nextOffset
    };
}
exports.createPagination = createPagination;
function checkIDArray(name, idArr) {
    if (!Array.isArray(idArr))
        throw new Error("Parameter " + name + " must be an array of ids.");
    else if (idArr.length === 0)
        throw new Error("Parameter '" + name + "' cannot be an empty array. Expecting between 1 and " + config_1.maxQueryIds + " values");
    else if (idArr.length > config_1.maxQueryIds)
        throw new Error("Parameter '" + name + "' cannot have more than " + config_1.maxQueryIds + " items. Found: " + idArr.length);
    var badVals = idArr.filter(function (id) { return !lodash_1.isInteger(id) || id < 0; });
    if (badVals.length > 0)
        throw new Error("Parameter '" + name + " must be an array of postive integers. Found the following bad values: " + badVals.join(', '));
}
function checkGeoJSON(jsonString) {
    if (jsonString.length === 0)
        throw new Error("Cannot pass an empty string to parameter 'polygon'");
    try {
        JSON.parse(jsonString);
    }
    catch (e) {
        throw new Error("Could not parse GeoJSON from parameter 'polygon'");
    }
}
function checkPointDistance(pointDistance) {
    var errs = [];
    if (!lodash_1.isNumber(pointDistance.latitude))
        errs.push('You must provide a latitude with pointDistance');
    else if (pointDistance.latitude > 90 || pointDistance.latitude < -90)
        errs.push("pointDistance.latitude must be a valid number from -90 to 90. Got: " + pointDistance.latitude);
    if (!lodash_1.isNumber(pointDistance.longitude))
        errs.push('You must provide a longitude with pointDistance');
    else if (!pointDistance.distance)
        errs.push('You must provide a distance with pointDistance');
    if (!lodash_1.isNumber(pointDistance.distance))
        errs.push('You must provide a distance with pointDistance');
    else if (pointDistance.distance < 0)
        errs.push("pointDistance.distance must be a positive number. Got: " + pointDistance.distance);
    if (errs.length === 0)
        return;
    else {
        throw new Error("Found the following problems with the 'pointDistance' parameter: " + errs.join(', '));
    }
}
var ID_ARRAYS = ['sampleIds', 'boxIds', 'projectIds', 'entityIds', 'siteIds'];
function checkExclusiveFilter(args, requireOne) {
    if (requireOne === void 0) { requireOne = false; }
    var validArgKeys = Object.keys(args).filter(function (ok) { return typeof args[ok] !== 'undefined'; });
    if (validArgKeys.length === 0) {
        if (!requireOne)
            return;
        else
            throw new Error("You must provide one of the following arguments: " + Object.keys(args).join(', '));
    }
    if (validArgKeys.length > 1) {
        throw new Error("You can only specify one of the filter arguments: " + Object.keys(args).join(', ') + ". Found: " + Object.keys(validArgKeys).join(', '));
    }
    validArgKeys.filter(function (ak) { return ID_ARRAYS.indexOf(ak) > -1; }).forEach(function (ak) { return checkIDArray; });
    if (args.polygon)
        checkGeoJSON(args.polygon);
    if (args.pointDistance)
        checkPointDistance(args.pointDistance);
}
exports.checkExclusiveFilter = checkExclusiveFilter;
//# sourceMappingURL=resolverUtil.js.map