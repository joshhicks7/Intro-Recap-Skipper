const SKIP_RULES = {
    netflix: {
        intro: 'button[aria-label="Skip Intro"]',
        recap: 'button[aria-label="Skip Recap"]'
    },
    primevideo: {
        intro: 'button[data-testid="skip-intro-button"]',
        recap: 'button[data-testid="skip-recap-button"]'
    },
    peacock: {
        intro: 'button[data-testid="skip-intro"]',
        recap: 'button.skip__button'
    },
    hulu: {
        intro: 'button[aria-label="Skip Intro"], .skip-button',
        recap: 'button[aria-label="Skip Recap"], .skip-button'
    }
};

const hostname = window.location.hostname;

let service = null;
if (hostname.includes("netflix")) service = "netflix";
else if (hostname.includes("primevideo") || hostname.includes("amazon")) service = "primevideo";
else if (hostname.includes("peacock")) service = "peacock";
else if (hostname.includes("hulu")) service = "hulu";

let skipIntroEnabled = true;
let skipRecapEnabled = true;
let activeRules = [];

chrome.storage.sync.get(["skipIntro", "skipRecap"], (data) => {
    // default to true if undefined
    skipIntroEnabled = (data.skipIntro === undefined) ? true : data.skipIntro;
    skipRecapEnabled = (data.skipRecap === undefined) ? true : data.skipRecap;

    rebuildActiveRules();
    startObserver();
});

function rebuildActiveRules() {
    activeRules = [];
    if (!service || !SKIP_RULES[service]) return;

    if (skipIntroEnabled) activeRules.push(SKIP_RULES[service].intro);
    if (skipRecapEnabled) activeRules.push(SKIP_RULES[service].recap);
}

let lastClickTime = 0;

// since Hulu tends to freeze
function clickSkipIfExistsThrottled() {
    const now = Date.now();
    if (now - lastClickTime < 200) return; // 200ms throttle
    lastClickTime = now;
    clickSkipIfExists();
}

function clickSkipIfExists() {
    // First try selectors
    for (const selector of activeRules) {
        const buttons = document.querySelectorAll(selector);
        for (const btn of buttons) {
            // For Hulu, check text to differentiate recap vs intro
            const text = btn.textContent.trim().toLowerCase();
            if ((skipIntroEnabled && text.includes("intro")) ||
                (skipRecapEnabled && text.includes("recap")) ||
                text === "skip") { // fallback for generic skip
                console.log("AutoSkip: Clicked", selector, text);
                btn.click();
                return;
            }
        }
    }

    // Fallback: any button text contains "skip"
    const allButtons = [...document.querySelectorAll("button")];
    for (const btn of allButtons) {
        const text = btn.textContent.trim().toLowerCase();
        if ((skipIntroEnabled && text.includes("intro")) ||
            (skipRecapEnabled && text.includes("recap")) ||
            (skipIntroEnabled || skipRecapEnabled) && text === "skip") {
            console.log("AutoSkip (fallback): Clicked button with text:", text);
            btn.click();
            return;
        }
    }
}

function startObserver() {
    const observer = new MutationObserver(() => {
        clickSkipIfExistsThrottled();
    });

    let targetNode = document.body;
    if (service === "hulu") {
        const player = document.querySelector('div[data-testid="video-player"]');
        if (player) targetNode = player;
    }

    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });
}

// listen for storage changes and update activeRules dynamically
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        if (changes.skipIntro) skipIntroEnabled = changes.skipIntro.newValue;
        if (changes.skipRecap) skipRecapEnabled = changes.skipRecap.newValue;

        rebuildActiveRules();

        if (activeRules.length > 0) clickSkipIfExistsThrottled();
    }
});
