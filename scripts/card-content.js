class SearchCard {
  id;
  container;
  answerElement;
  questionElement;

  constructor(id, container, answerElement, questionElement) {
    this.id = id;
    this.container = container;
    this.answerElement = answerElement;
    this.questionElement = questionElement;
  }
}

class CardContent {
  id;
  container;
  answerElement;
  questionElement;
  autoFillButton;
  abortController;

  constructor(searchCard) {
    this.abortController = new AbortController();

    this.id = searchCard.id;
    this.container = searchCard.container;
    this.answerElement = searchCard.answerElement;
    this.questionElement = searchCard.questionElement;

    const autoFillButtonId = this.getAutoFillButtonHtmlId(this.id);
    this.autoFillButton = document.getElementById(autoFillButtonId);

    if (!this.autoFillButton) {
      const autoFillButton = this.buildAutoFillButton(this.id);
      this.placeAutoFillButton(this.container, autoFillButton);

      this.autoFillButton = autoFillButton;
      this.autoFillButton.addEventListener(
        'click',
        () => this.submitAutoFill(),
        {
          signal: this.abortController.signal,
        }
      );
    }
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

        this.answerElement.focus();
      })
      .finally(() => {
        this.autoFillButton.textContent = 'Auto fill';
      });
  }

  buildAutoFillButton(id) {
    throw new Error('buildAutoFillButton not implemented!!!');
  }
  placeAutoFillButton(container, autoFillButton) {
    throw new Error('placeAutoFillButton not implemented!!!');
  }

  static setTextAreaValue(element, value) {
    element.value = value;
    element.dispatchEvent(new window.Event('input', { bubbles: true }));
  }

  static sanitizeExample(example) {
    return example.replace('<b>', '').replace('</b>', '');
  }

  static maskExample(example) {
    return example.replace(/<b>.*?<\/b>/, '...');
  }

  getAutoFillButtonHtmlId(id) {
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
