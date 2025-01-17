// ------------------------------------------------------

class CardContent {
  cardContentElement;
  answerElement;
  questionElement;
  autoFillButton;
  abortController;

  constructor(answerTextAreaElement) {
    this.abortController = new AbortController();

    this.answerElement = answerTextAreaElement;
    this.cardContentElement = this.answerElement.closest('.card-contents');
    this.questionElement = this.getQuestionElement();

    this.answerElement.addEventListener(
      'input',
      (event) => this.textAreaInputChanged(event),
      {
        signal: this.abortController.signal,
      }
    );
  }

  textAreaInputChanged(event) {
    if (!event.target.value && this.autoFillButton) {
      this.removeAutoFillButton();
    } else if (event.target.value && !this.autoFillButton) {
      this.addAutoFillButton();
    }
  }

  addAutoFillButton() {
    this.autoFillButton = CardContent.buildAutoFillButton();
    this.getCardControlsElement().appendChild(this.autoFillButton);

    this.autoFillButton.addEventListener('click', () => this.submitAutoFill(), {
      signal: this.abortController.signal,
    });
  }

  removeAutoFillButton() {
    this.autoFillButton.remove();
    this.autoFillButton = undefined;
  }

  submitAutoFill() {
    this.autoFillButton.textContent = 'Loading...';

    getDefinitions(this.answerElement.value)
      .then((definitions) => {
        if (definitions.length === 0) {
          this.questionElement.value =
            'Some errors happens, cannot retrieve data from API';
          return;
        }

        const definition = definitions[0];
        const example = definition.examples[0];
        const maskedExample = example.replace(/<b>.*?<\/b>/, '...');
        const sanitizedExample = example.replace('<b>', '').replace('</b>', '');
        this.questionElement.value = `(${definition.type}) ${definition.definition}\n${maskedExample}`;

        this.answerElement.value =
          this.answerElement.value + '\n' + sanitizedExample;
      })
      .finally(() => {
        this.autoFillButton.textContent = 'Auto fill';
      });
  }

  getCardControlsElement() {
    return this.cardContentElement.querySelector('.card-controls');
  }
  getQuestionElement() {
    const cardId = this.answerElement.id.substring(
      7,
      this.answerElement.id.length
    );

    return document.querySelector('#question-' + cardId);
  }

  static buildAutoFillButton() {
    const container = document.createElement('div');
    container.classList.add('autofill__container');
    container.style.display = 'flex';
    container.style.marginLeft = '6px';

    const button = document.createElement('button');
    button.textContent = 'Auto fill';

    container.appendChild(button);

    return container;
  }

  clear() {
    if (this.autoFillButton) {
      this.removeAutoFillButton();
    }
    this.abortController.abort();
  }
}

// ----------------------------

function getCardAnswerTextAreaInputs() {
  const textareas = document.getElementsByClassName('textarea-input') || [];
  const answerTextAreas = Array.from(textareas).filter((a) => {
    const nameAttribute = a.attributes.getNamedItem('name');
    return nameAttribute && nameAttribute.value === 'answer';
  });

  return answerTextAreas || [];
}

function buildCardContents() {
  const textareas = getCardAnswerTextAreaInputs();
  const cardContents = Array.from(textareas).map(
    (area) => new CardContent(area)
  );

  return cardContents || [];
}

let cardContents = buildCardContents();

Array.from(document.getElementsByClassName('new-card-button')).forEach(
  (newCardButton) => {
    newCardButton.addEventListener('click', () => {
      setTimeout(() => {
        const textareas = getCardAnswerTextAreaInputs();
        const newTextArea = textareas[textareas.length - 1];
        cardContents.push(new CardContent(newTextArea));
      }, 100);
    });
  }
);
