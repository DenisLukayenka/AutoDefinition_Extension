import openAiService from './openai_service.js';
import secrets from './secrets.js';

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.type === 'OpenAiGetDefinition') {
    openAiService.callOpenAiDefinition(
      request,
      secrets.openAiServiceUrl,
      secrets.openAiServiceQuery,
      sendResponse
    );

    return true;
  }

  return false;
});

let currentTab;

chrome.webRequest.onCompleted.addListener(
  async function (details) {
    if (details.url.indexOf('pages?limit') > -1) {
      let [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tab && !currentTab) {
        currentTab = tab;
      }

      await chrome.tabs.sendMessage(currentTab.id, { type: 'CARDS_LOADED' });
    }
  },
  { urls: ['https://learn.supermemo.com/*'] }
);
