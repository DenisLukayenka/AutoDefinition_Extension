const openAiFunctionUrl = '';
const openAiQuery = '';

function callOpenAiDefinition(request, sender, sendResponse) {
  (async () => {
    try {
      const encodedSentence = encodeURI(request.sentence);
      const definitionsResponse = await fetch(
        openAiFunctionUrl + encodedSentence + openAiQuery
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
