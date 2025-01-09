document.addEventListener('DOMContentLoaded', function() {
    const highlightsList = document.getElementById('highlights-list');
    const clearAllButton = document.getElementById('clearAll');
    const highlighterTool = document.getElementById('highlighterTool');
    const statusText = document.getElementById('status');

    
   
    chrome.storage.local.get(["highlighterActive"]).then((result) => {
        statusText.textContent =result['highlighterActive'] ?'Highlighter is active':'Highlighter is Inactive';
       if(result['highlighterActive'])
        highlighterTool.classList.add('active');
      });

    highlighterTool.addEventListener('click', ()=> {
        console.log("Hello World1");
        const ToggleResult = highlighterTool.classList.toggle('active');
        statusText.textContent =ToggleResult ?'Highlighter is active':'Highlighter is Inactive';
        
        chrome.storage.local.set({ "highlighterActive": ToggleResult });

        

    })
    

    // Clear all highlights
    clearAllButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all highlights?')) {
            chrome.storage.sync.set({ highlights: [] }, function() {
                refreshHighlights();
                
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'removeAllHighlights'
                        });
                    }
                });
            });
        }
    });



    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    function truncateUrl(url) {
        const maxLength = 30;
        return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
    }

    function refreshHighlights() {
        chrome.storage.sync.get({ highlights: [] }, function(data) {
            const highlights = data.highlights;
            highlightsList.innerHTML = '';

            if (highlights.length === 0) {
                highlightsList.innerHTML = '<div class="no-highlights">No highlights yet!</div>';
                return;
            }

            highlights.sort((a, b) => b.timestamp - a.timestamp);

            highlights.forEach(function(highlight, index) {
                const div = document.createElement('div');
                div.className = 'highlight-item';
                div.innerHTML = `
                    <div class="highlight-text">
                        <div>${highlight.text}</div>
                        <div class="highlight-url">${truncateUrl(highlight.pageUrl)}</div>
                        <div class="timestamp">${formatDate(highlight.timestamp)}</div>
                    </div>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                `;

                const deleteBtn = div.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', function() {
                    deleteHighlight(index);
                });

                highlightsList.appendChild(div);
            });
        });
    }

    function deleteHighlight(index) {
        chrome.storage.sync.get({ highlights: [] }, function(data) {
            const highlights = data.highlights;
            const highlightToRemove = highlights[index];

            highlights.splice(index, 1);
            chrome.storage.sync.set({ highlights: highlights }, function() {
                refreshHighlights();

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'removeHighlight',
                            highlightId: highlightToRemove.id
                        });
                    }
                });
            });
        });
    }

    // Initial load of highlights
    refreshHighlights();
});
