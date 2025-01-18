// ------------------------------------------------------

class CardContent {
  id;
  cardContentElement;
  answerElement;
  questionElement;
  autoFillButton;
  abortController;

  constructor(answerTextAreaElement) {
    this.abortController = new AbortController();

    this.answerElement = answerTextAreaElement;
    this.id = CardContent.getElementId(this.answerElement);

    this.cardContentElement = this.answerElement.closest('.card-contents');
    this.questionElement = this.getQuestionElement();

    const autoFillButtonId = CardContent.getAutoFillButtonHtmlId(this.id);
    this.autoFillButton = document.getElementById(autoFillButtonId);

    if (!this.autoFillButton) {
      this.addAutoFillButton();
    }
  }

  addAutoFillButton() {
    this.autoFillButton = CardContent.buildAutoFillButton(this.id);
    this.getCardControlsElement().appendChild(this.autoFillButton);

    this.autoFillButton.addEventListener('click', () => this.submitAutoFill(), {
      signal: this.abortController.signal,
    });
  }

  submitAutoFill() {
    this.autoFillButton.textContent = 'Loading...';

    getDefinition(this.answerElement.value)
      .then((definition) => {
        if (!definition) {
          this.questionElement.value =
            'Some errors happens, cannot retrieve data from API';
          return;
        }

        const example = definition.examples[0];
        const maskedExample = CardContent.maskExample(example);
        const sanitizedExample = CardContent.sanitizeExample(example);

        CardContent.setTextAreaValue(
          this.questionElement,
          `(${definition.type}) ${definition.definition}\n\"${maskedExample}\"`
        );

        CardContent.setTextAreaValue(
          this.answerElement,
          `${this.answerElement.value}\n\"${sanitizedExample}\"`
        );
      })
      .finally(() => {
        this.autoFillButton.textContent = 'Auto fill';
      });
  }

  getCardControlsElement() {
    return this.cardContentElement.querySelector('.card-controls');
  }
  getQuestionElement() {
    return document.getElementById('question-' + this.id);
  }

  static setTextAreaValue(element, value) {
    element.value = value;
    element.dispatchEvent(new window.Event('change', { bubbles: true }));
  }

  static buildAutoFillButton(id) {
    const container = document.createElement('div');
    container.classList.add('autofill__container');
    container.style.display = 'flex';
    container.style.marginLeft = '6px';
    container.id = CardContent.getAutoFillButtonHtmlId(id);

    const button = document.createElement('button');
    button.textContent = 'Auto fill';
    button.type = 'button';

    container.appendChild(button);

    return container;
  }

  static sanitizeExample(example) {
    return example.replace('<b>', '').replace('</b>', '');
  }

  static maskExample(example) {
    return example.replace(/<b>.*?<\/b>/, '...');
  }

  static getElementId(element) {
    return element.id.substring(7, element.id.length);
  }

  static getAutoFillButtonHtmlId(id) {
    return 'autofill__' + id;
  }

  clear() {
    this.abortController.abort();

    if (this.autoFillButton) {
      this.autoFillButton.remove();
      this.autoFillButton = undefined;
    }
  }
}

// ----------------------------

function getCardAnswerTextAreas() {
  const textareas = document.getElementsByClassName('textarea-input') || [];
  const answerTextAreas = Array.from(textareas).filter((a) => {
    const nameAttribute = a.attributes.getNamedItem('name');
    return nameAttribute && nameAttribute.value === 'answer';
  });

  return answerTextAreas || [];
}

// Initial timeout to let page load

let cardContents = [];
let cardsToAdd = 0;

function syncPageCards() {
  const textareas = getCardAnswerTextAreas();

  for (let i = 0; i < textareas.length; i++) {
    const textArea = textareas[i];
    cardContents.push(new CardContent(textArea));
  }
}

function syncNewPageCards(attempt = 0) {
  if (attempt > 10) {
    cardContents.forEach((c) => c.clear());
    cardContents = [];
    cardsToAdd = 0;
    console.log('Explainer: Cannot increment new Cards');

    syncPageCards();
    return;
  }

  if (cardsToAdd <= 0) {
    cardsToAdd = 0;
    return;
  }

  const textareas = getCardAnswerTextAreas();
  const timeInterval = 200;

  for (let i = textareas.length - 1; i >= 0 && cardsToAdd > 0; i--) {
    const textArea = textareas[i];
    const textAreaId = CardContent.getElementId(textArea);

    if (cardContents.findLastIndex((c) => c.id === textAreaId) === -1) {
      cardContents.push(new CardContent(textArea));
      cardsToAdd = cardsToAdd - 1;
    }
  }

  setTimeout(() => {
    syncNewPageCards(attempt + 1);
  }, timeInterval);
}

// Build initial cards
setTimeout(() => {
  syncPageCards();
}, 3000);

// Subscribe on card add
setTimeout(() => {
  Array.from(document.getElementsByClassName('add-button')).forEach(
    (addCardButton) => {
      addCardButton.addEventListener('click', () => {
        cardsToAdd = cardsToAdd + 1;
        syncNewPageCards();
      });
    }
  );
}, 3000);
