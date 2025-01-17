import secrets from './secrets';

function callOpenAiDefinition(request, sender, sendResponse) {
  (async () => {
    try {
      const encodedSentence = encodeURI(request.sentence);
      const definitionsResponse = await fetch(
        secrets.openAiServiceUrl + encodedSentence + secrets.openAiServiceQuery
      );
      const definitions = await definitionsResponse.json();

      return sendResponse(definitions);
    } catch (error) {
      console.log('An error happens during calling open api');
      console.log(error);
      return sendResponse([]);
    }
  })();

  return true;
}

export default { callOpenAiDefinition };
