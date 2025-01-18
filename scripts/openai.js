function getDefinition(sentence) {
  const message = {
    type: 'OpenAiGetDefinition',
    sentence: sentence,
  };

  return new Promise((resolve, reject) => {
    (async () => {
      await chrome.runtime.sendMessage(message, function (response) {
        resolve(response?.definitions[0] || []);
      });
    })();
  });
}
