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
    hbomax: [
        'button[data-testid="player-skip-intro"]',
        'button[data-testid="player-skip-recap"]',
        'button[class*="skip"]' // fallback
    ],
    disney: [
        'button[aria-label="Skip"]',
        'button[aria-label="Skip Intro"]',
        'button[aria-label="Skip Recap"]'
    ]
};

const hostname = window.location.hostname;

let activeRules = [];

if (hostname.includes("netflix")) {
    activeRules = SKIP_RULES.netflix;
} else if (hostname.includes("primevideo") || hostname.includes("amazon")) {
    activeRules = SKIP_RULES.primevideo;
} else if (hostname.includes("peacock")) {
    activeRules = SKIP_RULES.peacock;
} else if (hostname.includes("hulu")) {
    activeRules = SKIP_RULES.hulu;
} else if (hostname.includes("hbomax") || hostname.includes("max.com")) {
    activeRules = SKIP_RULES.hbomax;
} else if (hostname.includes("disney")) {
    activeRules = SKIP_RULES.disney;
}
