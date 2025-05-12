"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookStatus = void 0;
var BookStatus;
(function (BookStatus) {
    BookStatus[BookStatus["Available"] = 0] = "Available";
    BookStatus[BookStatus["Borrowed"] = 1] = "Borrowed";
    BookStatus[BookStatus["Lost"] = 2] = "Lost";
})(BookStatus || (exports.BookStatus = BookStatus = {}));
