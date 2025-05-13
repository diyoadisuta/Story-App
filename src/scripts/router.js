class Router {
  constructor({ presenter, model }) {
    this._presenter = presenter;
    this._model = model;
    this._initRouter();
  }

  _initRouter() {
    window.addEventListener('hashchange', () => {
      this._handleRoute();
    });

    window.addEventListener('load', () => {
      this._handleRoute();
    });
  }

  _handleRoute() {
    const { hash } = window.location;

    if (hash.startsWith('#/story/')) {
      const storyId = hash.split('/')[2];
      this._presenter.initStoryDetailPage(storyId);
      return;
    }

    switch (hash) {
      case '#/login':
        this._presenter.initLoginPage();
        break;
      case '#/register':
        this._presenter.initRegisterPage();
        break;
      case '#/':
        this._presenter.initHomePage();
        break;
      case '#/add':
        this._presenter.initAddStoryPage();
        break;
      case '#/offline-stories':
        this._presenter.initOfflineStoriesPage();
        break;
      default:
        this._presenter.initNotFoundPage();
    }
  }
}

export default Router;
