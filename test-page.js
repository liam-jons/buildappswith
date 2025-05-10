"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestPage;
var react_1 = __importDefault(require("react"));
var simple_marketplace_error_boundary_1 = require("./components/marketplace/components/error-boundaries/simple-marketplace-error-boundary");
function TestPage() {
    return (react_1.default.createElement(simple_marketplace_error_boundary_1.SimpleMarketplaceErrorBoundary, null,
        react_1.default.createElement("div", null, "Test content")));
}
