// load saved toggle states (default = true)
chrome.storage.sync.get(["skipIntro", "skipRecap"], (data) => {
  document.getElementById("skipIntroToggle").checked = data.skipIntro !== false;
  document.getElementById("skipRecapToggle").checked = data.skipRecap !== false;
});

function saveState() {
  chrome.storage.sync.set({
    skipIntro: document.getElementById("skipIntroToggle").checked,
    skipRecap: document.getElementById("skipRecapToggle").checked
  });
}

document.getElementById("skipIntroToggle").addEventListener("change", saveState);
document.getElementById("skipRecapToggle").addEventListener("change", saveState);