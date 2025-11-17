
const SKIP_RULES = {
    netflix: [
        'button[aria-label="Skip Intro"]',
        'button[aria-label="Skip Recap"]'
    ],
    primevideo: [
        'button[data-testid="skip-intro-button"]',
        'button[data-testid="skip-recap-button"]'
    ],
    peacock: [
        'button.skip__button',
        'button[data-testid="skip-intro"]'
    ],
    hulu: [
        '.skip-button',
        'button[aria-label="Skip Intro"]',
        'button[aria-label="Skip Recap"]'
    ],
};

const hostname = window.location.hostname;

let activeRules = [];

if (hostname.includes("netflix")) activeRules = SKIP_RULES.netflix;
else if (hostname.includes("primevideo") || hostname.includes("amazon")) activeRules = SKIP_RULES.primevideo;
else if (hostname.includes("peacock")) activeRules = SKIP_RULES.peacock;
else if (hostname.includes("hulu")) activeRules = SKIP_RULES.hulu;

let lastClickTime = 0;

// since Hulu tends to freeze
function clickSkipIfExistsThrottled() {
    const now = Date.now();
    if (now - lastClickTime < 200) return; // 200ms throttle
    lastClickTime = now;
    clickSkipIfExists();
}

function clickSkipIfExists() {
    for (const selector of activeRules) {
        const btn = document.querySelector(selector);
        if (btn) {
            console.log("AutoSkip: Clicked", selector);
            btn.click();
            return;
        }
    }

    // fallback: match by visible text
    const textMatches = ["skip", "skip intro", "skip recap"];
    const buttons = [...document.querySelectorAll("button")];

    for (let btn of buttons) {
        if (textMatches.includes(btn.textContent.trim().toLowerCase())) {
            console.log("Auto-Skip: clicked via text match");
            btn.click();
            return;
        }
    }
}

// MutationObserver is kind of like a listener
// it checks for mutations/when the page updates the UI (pretty frequent)
// allows "background listening" without constantly polling
const observer = new MutationObserver(() => {
    clickSkipIfExistsThrottled();
});

// Observe the entire document, but Hulu tends to freeze (so only observe part)
let targetNode = document.body;

if (hostname.includes("hulu")) {
    const player = document.querySelector('div[data-testid="video-player"]');
    if (player) targetNode = player;
}

observer.observe(targetNode, {
    childList: true,
    // not just direct children
    subtree: true
});

// code to just poll for Hulu if it doesn't work:
/* 
if (hostname.includes("hulu")) {
    setInterval(clickSkipIfExists, 1000); // every second
}
*/
