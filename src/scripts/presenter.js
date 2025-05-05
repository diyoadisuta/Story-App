import AddStoryForm from './addStoryForm.js';
import OfflineStories from './offlineStories.js';

class Presenter {
  constructor({ model, view }) {
    this._model = model;
    this._view = view;
    this._app = document.querySelector('#app');
    this.initializeAuth();
  }

  initializeAuth() {
    this.updateNavigation();
    if (!this._model.isLoggedIn() && window.location.hash !== '#/login' && window.location.hash !== '#/register') {
      window.location.hash = '#/login';
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    try {
      await this._model.login(email, password);
      window.location.hash = '#/';
      this.updateNavigation();
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    try {
      await this._model.register(name, email, password);
      window.location.hash = '#/login';
      this._view.showError('Registration successful! Please login.');
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  handleLogout() {
    this._model.logout();
    window.location.hash = '#/login';
    this.updateNavigation();
  }

  updateNavigation() {
    const nav = document.querySelector('nav');
    const menuContent = this._model.isLoggedIn() 
      ? `<a href="#/" role="menuitem" aria-label="Home">Home</a>
         <a href="#/add" role="menuitem" aria-label="Add Story">Add Story</a>
         <a href="#/offline-stories" role="menuitem" aria-label="Offline Stories">Offline Stories</a>
         <a href="#" id="logout" role="menuitem" aria-label="Logout">Logout</a>`
      : `<a href="#/add" role="menuitem" aria-label="Add Guest Story">Add Guest Story</a>
         <a href="#/offline-stories" role="menuitem" aria-label="Offline Stories">Offline Stories</a>
         <a href="#/login" role="menuitem" aria-label="Login">Login</a>
         <a href="#/register" role="menuitem" aria-label="Register">Register</a>`;

    nav.innerHTML = menuContent;
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    if (this._model.isLoggedIn()) {
      const logoutButton = document.querySelector('#logout');
      this.addTouchAndClickHandler(logoutButton, (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  addTouchAndClickHandler(element, handler) {
    let touchStarted = false;
    let touchMoved = false;

    element.addEventListener('touchstart', () => {
      touchStarted = true;
      touchMoved = false;
    }, { passive: true });

    element.addEventListener('touchmove', () => {
      touchMoved = true;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      if (touchStarted && !touchMoved) {
        handler(e);
      }
    });

    element.addEventListener('click', handler);
  }

  async initLoginPage() {
    await this._view.updateContent(this._view.getLoginTemplate());
    document.querySelector('#loginForm').addEventListener('submit', (e) => this.handleLogin(e));
  }

  async initRegisterPage() {
    await this._view.updateContent(this._view.getRegisterTemplate());
    document.querySelector('#registerForm').addEventListener('submit', (e) => this.handleRegister(e));
  }

  async initAddStoryPage() {
    const addStoryForm = new AddStoryForm(this._app, this._model);
    addStoryForm.renderForm();
  }

  async initHomePage() {
    try {
      await this._view.showLoading();
      const stories = await this._model.getStories();
      await this._view.updateContent(this._view.getStoryListTemplate(stories));

      // Initialize maps for each story
      stories.forEach(story => {
        if (story.lat && story.lon) {
          const map = L.map(`map-${story.id}`).setView([story.lat, story.lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          L.marker([story.lat, story.lon]).addTo(map);

          // Disable map zoom when scrolling over it on mobile
          map.scrollWheelZoom.disable();
          
          // Enable map zoom only when map has focus
          const mapElement = document.getElementById(`map-${story.id}`);
          mapElement.addEventListener('focus', () => map.scrollWheelZoom.enable());
          mapElement.addEventListener('blur', () => map.scrollWheelZoom.disable());
          
          // Enable zoom on touch devices when map is tapped
          mapElement.addEventListener('touchstart', () => map.scrollWheelZoom.enable());
        }
      });

      const storyCards = document.querySelectorAll('.story-card');
      storyCards.forEach((card) => {
        const { storyId } = card.dataset;
        this.addTouchAndClickHandler(card, () => {
          window.location.hash = `#/story/${storyId}`;
        });
      });
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  async initStoryDetailPage(id) {
    try {
      if (!this._model.isLoggedIn()) {
        window.location.hash = '#/login';
        return;
      }

      await this._view.showLoading();
      const story = await this._model.getStoryDetail(id);
      await this._view.updateContent(this._view.getStoryDetailTemplate(story));

      // Initialize map for story detail
      if (story.lat && story.lon) {
        const map = L.map('detail-map').setView([story.lat, story.lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([story.lat, story.lon]).addTo(map);
      }
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  async initOfflineStoriesPage() {
    const offlineStories = new OfflineStories(this._app);
    await offlineStories.render();
  }

  async initNotFoundPage() {
    try {
      const response = await fetch('/not-found.html');
      const html = await response.text();
      this._app.innerHTML = html;
    } catch (error) {
      console.error('Error loading not found page:', error);
      this._app.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h1>404 - Halaman Tidak Ditemukan</h1>
          <p>Maaf, halaman yang Anda cari tidak dapat ditemukan.</p>
          <a href="/" style="color: #007bff;">Kembali ke Beranda</a>
        </div>
      `;
    }
  }
}

export default Presenter;
