// ---------------------------------------------------------------------------
// Marketplace Microservice — Public Entry Point
//
// Other services or the shell app import from here, NEVER from deep paths.
// This is the boundary. If another service needs something from Marketplace,
// it must be exported here. If it's not exported, it's internal.
// ---------------------------------------------------------------------------

export { default as MarketplacePage }  from "./pages/MarketplacePage.jsx";
export { default as AboutPage }        from "./pages/AboutPage.jsx";
export { default as SubscribePage }    from "./pages/SubscribePage.jsx";
export * as MarketplaceAPI             from "./api/marketplace.api.js";
export { THEME, SUBSCRIPTION_PLANS }   from "./constants/theme.js";
export { default as Translations }     from "./constants/translations.js";