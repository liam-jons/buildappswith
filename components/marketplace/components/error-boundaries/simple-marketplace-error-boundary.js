"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleMarketplaceErrorBoundary = SimpleMarketplaceErrorBoundary;
var react_1 = __importDefault(require("react"));
var Sentry = __importStar(require("@sentry/nextjs"));
/**
 * A simplified version of MarketplaceErrorBoundary that doesn't depend on any external components
 * This is used for testing compilation without introducing additional dependencies
 */
function SimpleMarketplaceErrorBoundary(_a) {
    var children = _a.children, _b = _a.componentName, componentName = _b === void 0 ? 'Marketplace component' : _b;
    // Basic error handler
    var handleError = function (error, info) {
        // Log to console only
        console.error("Error in ".concat(componentName, ":"), error);
        // Send to Sentry
        Sentry.withScope(function (scope) {
            scope.setTag("component", componentName);
            scope.setExtra("componentStack", info.componentStack);
            Sentry.captureException(error);
        });
    };
    return (react_1.default.createElement("div", { className: "marketplace-error-boundary" }, children));
}
