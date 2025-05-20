document.addEventListener("DOMContentLoaded", () => {
  const scrapeEmails = document.getElementById("scrapeEmails");
  const list = document.getElementById("emailsList");

  if (!scrapeEmails || !list) {
    console.error("Required DOM elements not found.");
    return;
  }

  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener((request) => {
    const emails = request.emails;
    list.innerHTML = ""; // Clear old list

    if (!emails || emails.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No emails found.";
      list.appendChild(li);
    } else {
      emails.forEach(email => {
        const li = document.createElement("li");
        li.textContent = email;
        list.appendChild(li);
      });
    }
  });

  // On button click, inject the email scraper function
  scrapeEmails.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("brave://")) {
      alert("This extension cannot run on internal browser pages like chrome:// or brave://");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeEmailsFromPage
    });
  });
});

// This function is injected into the webpage
function scrapeEmailsFromPage() {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  const emails = document.body.innerText.match(emailRegex) || [];
  chrome.runtime.sendMessage({ emails });
}
