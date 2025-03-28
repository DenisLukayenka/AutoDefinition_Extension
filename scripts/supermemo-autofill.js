setTimeout(() => {
  CardContent.prototype.placeAutoFillButton = function (
    container,
    autoFillButton
  ) {
    container.appendChild(autoFillButton);
  };

  CardContent.prototype.buildAutoFillButton = function (id) {
    const container = document.createElement('div');
    container.classList.add('autofill__container');
    container.style.position = 'absolute';
    container.style.right = '-70px';
    container.style.top = '10px';
    container.id = this.getAutoFillButtonHtmlId(id);

    const button = document.createElement('button');
    button.textContent = 'Auto fill';
    button.type = 'button';

    container.appendChild(button);

    return container;
  };

  new SupermemoAutoFillBootstrap().init();
}, 3000);

class SupermemoAutoFillBootstrap {
  cardContents = [];
  cardsToAdd = 0;

  static MaxSyncAttempts = 10;
  static InitialTimeout = 3000;
  static RetryTimeout = 500;

  init() {
    setTimeout(() => {
      this.resetCards();
      this.subscribeOnNewCardAdded();
    }, SupermemoAutoFillBootstrap.InitialTimeout);
  }

  resetCards() {
    if (this.cardContents && this.cardContents.length > 0) {
      this.cardContents.forEach((c) => c.clear());
      this.cardContents = undefined;
    }

    const searchCards = this.searchAllCards();

    this.cardsToAdd = 0;
    this.cardContents = searchCards.map((card) => new CardContent(card));
  }

  subscribeOnNewCardAdded() {
    // Button rerenders and listener fails
    document
      .getElementsByClassName('add-new-element')[0]
      .addEventListener('click', () => {
        setTimeout(() => {
          this.cardsToAdd = this.cardsToAdd + 1;
          this.syncContentElements();
        }, 300);
      });
  }

  searchAllCards() {
    const containers =
      Array.from(document.getElementsByTagName('sm-page-list-item')) || [];

    const searchCards = containers.map((container) => {
      const answerElement = container.querySelector(
        '.answer-container textarea'
      );
      const questionElement = container.querySelector(
        '.question-container textarea'
      );

      const id = container.className;

      return new SearchCard(id, container, answerElement, questionElement);
    });

    return searchCards;
  }

  syncContentElements(attempt = 0) {
    if (attempt > SupermemoAutoFillBootstrap.MaxSyncAttempts) {
      console.log('Explainer: Cannot increment new Cards');

      this.resetCards();
      return;
    }

    if (this.cardsToAdd <= 0) {
      this.cardsToAdd = 0;

      console.log('Explainer: Sync finished successfully');
      return;
    }

    const allSearchCards = this.searchAllCards();

    for (
      let i = allSearchCards.length - 1;
      i >= 0 && this.cardsToAdd > 0;
      i--
    ) {
      const searchCard = allSearchCards[i];

      if (
        this.cardContents.findLastIndex((c) => c.id === searchCard.id) === -1
      ) {
        this.cardContents.push(new CardContent(searchCard));
        this.cardsToAdd = this.cardsToAdd - 1;
      }
    }

    setTimeout(() => {
      this.syncContentElements(attempt + 1);
    }, SupermemoAutoFillBootstrap.RetryTimeout);
  }
}
