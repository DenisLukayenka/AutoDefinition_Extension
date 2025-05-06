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
