
let isShiftPressed = false;
let isHighlighterActive = false;

    console.log("contnet load");
// Check initial state
chrome.storage.local.get(["highlighterActive"], (result) => {
    isHighlighterActive = result.highlighterActive;
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleHighlighter') {
        isHighlighterActive = message.state;
    }

    else if (message.action === 'removeHighlight') {
        const highlightElement = document.querySelector(`[data-highlight-id="${message.highlightId}"]`);
        if (highlightElement) {
            removeHighlight(highlightElement);
        }
    }
    else if (message.action === 'removeAllHighlights') {
        const highlights = document.querySelectorAll('.highlighted-text');
        highlights.forEach(highlight => removeHighlight(highlight));
    }
});



//Handle Control key si pressed
function Keytogller(e){
    if (e.type == 'keyup')
        return 'keydown';

    return 'keyup';
}
//Control Pressed Handling
function HandleCtrlDown(event) {
  if (event.key === 'Control') {
      isShiftPressed = !isShiftPressed;
      event.preventDefault(); // Prevents default behavior
    console.log(`key ${event.type} ${event.key} and Control is ${isShiftPressed}`);
    
    // Re-enable the listener when the key is released
}
document.addEventListener(Keytogller(event), HandleCtrlDown, { once: true });
}



document.addEventListener('keydown', HandleCtrlDown, { once: true });





// Handle text selection

document.addEventListener('mouseup', function() {


    if ((!isShiftPressed || !isHighlighterActive)) return;

    
    const selection = window.getSelection();
    const StringfySelction = selection.toString().trim();
    if (!selection || StringfySelction.length === 0)
        return;


    try {
        const selectedText = StringfySelction;
        const highlightId = 'highlight-' + Date.now();
        
        const range = selection.getRangeAt(0);
        highlightRange(range, highlightId);
        saveHighlight({
            id: highlightId,
            text: selectedText.substring(0,6)+"...",
            pageUrl: window.location.href,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Highlighting error:', error);
    } finally {
        selection.removeAllRanges();
    }
});

function highlightRange(range, highlightId) {
    const selectedContent = range.extractContents();
    const span = document.createElement('span');
    span.className = 'highlighted-text';
    span.dataset.highlightId = highlightId;
    span.style.backgroundColor = 'yellow';
    span.appendChild(selectedContent);
    range.insertNode(span);
}

function saveHighlight(highlightData) {
    chrome.storage.sync.get({ highlights: [] }, function(data) {
        const highlights = data.highlights;
        highlights.push(highlightData);
        console.log("highlits already mwogoda:", highlights)
        chrome.storage.sync.set({ highlights: highlights }, function() {
            console.log('Highlight saved:', highlightData);
        });
    });
}

function removeHighlight(element) {
    const parent = element.parentNode;
    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .highlighted-text {
        background-color: yellow;
       
        transition: background-color 0.3s ease;
    }
    .highlighted-text:hover {
        background-color:rgb(170, 157, 40);
    }
`;
document.head.appendChild(style);
