chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'summarize-text',
        title: 'Summarize with Text Summarizer',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'summarize-text') {
        chrome.tabs.sendMessage(
            tab.id,
            { action: 'getSelectedText' },
            async (response) => {
                const selectedText = response.text.trim();

                if (!selectedText) {
                    // Optionally, send a notification to the user
                    return;
                }

                try {
                    const summary = await getSummary(selectedText);
                    // Display the summary, e.g., via a notification or a new tab
                    alert(`Summary:\n\n${summary}`);
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        );
    }
});

// Include the getSummary function or import it if modularized
async function getSummary(text) {
    // Same implementation as in popup.js
}
