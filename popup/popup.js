const definitionsInput = document.getElementById('definitions__input');
definitionsInput.value = '[{"some": "not some"}]';

// document
//   .getElementById('definitions__input-submit')
//   .addEventListener('click', function () {
//     const definitions = JSON.parse(definitionsInput.value);
//     console.log(definitions);

//     const message = {
//       type: 'DefinitionsProvided',
//       definitions: definitions,
//     };

//     (async () => {
//       const [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true,
//       });
//       await chrome.tabs.sendMessage(tab.id, message);
//     })();
//   });
