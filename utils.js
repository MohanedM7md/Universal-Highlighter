// utils.js

function getActiveTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]) {
            callback(tabs[0]);
        } else {
            callback(null);
        }
    });
}

export { getActiveTab };
