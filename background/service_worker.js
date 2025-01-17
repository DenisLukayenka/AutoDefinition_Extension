import openAiService from './openai_service.js';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'OpenAiGetDefinition') {
    openAiService.callOpenAiDefinition(request, sender, sendResponse);

    return true;
  }

  return false;
});
