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
    const backendUrl = 'https://us-central1-txt-summerize-chrome-extension.cloudfunctions.net/summarizeText';
  
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Backend Error: ${response.status} ${response.statusText} - ${errorDetails}`);
    }
  
    const data = await response.json();
    return data.summary;
  }
  