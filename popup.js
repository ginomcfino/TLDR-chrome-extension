document.addEventListener('DOMContentLoaded', () => {
    const summarizeButton = document.getElementById('summarize-button');
    const summaryOutput = document.getElementById('summary-output');

    summarizeButton.addEventListener('click', () => {
        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // Execute a script in the active tab to get the selected text
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    function: getSelectedText,
                },
                async (injectionResults) => {
                    const [{ result: selectedText }] = injectionResults;

                    if (!selectedText) {
                        summaryOutput.textContent = 'Please select some text to summarize.';
                        return;
                    }

                    summaryOutput.textContent = 'Summarizing...';

                    try {
                        const summary = await getSummary(selectedText);
                        summaryOutput.textContent = summary;
                    } catch (error) {
                        console.error('Error:', error);
                        summaryOutput.textContent = 'An error occurred while summarizing the text.';
                    }
                }
            );
        });
    });
});

// This function runs in the context of the webpage to get the selected text
function getSelectedText() {
    return window.getSelection().toString();
}

async function getSummary(text) {
    const apiKey = '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'; // Replace with your actual API key
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
                { role: 'user', content: `Please provide a concise summary of the following text:\n\n"${text}"` },
            ],
            max_tokens: 150,
            temperature: 0.5,
        }),
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorDetails}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();
    return summary;
}
