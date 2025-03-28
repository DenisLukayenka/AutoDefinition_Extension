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

browser.webRequest.onCompleted.addListener(async function (details) {
  if (details.url.indexOf('pages?limit') > -1) {
    console.log(details);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.tabs.sendMessage(tab.id, { type: 'CARDS_LOADED' });
  }

}, { urls: ['https://learn.supermemo.com/*'] });