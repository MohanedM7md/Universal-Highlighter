// background.js
chrome.runtime.onStartup.addListener(function() {
    // Reset highlighter state when Chrome starts
    chrome.storage.local.set({ highlighterActive: false });
});

chrome.runtime.onInstalled.addListener(function() {
    // Initialize highlighter state when extension is installed
    chrome.storage.local.set({ highlighterActive: false });
});



