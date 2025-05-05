// View untuk rendering UI
class StoryView {
  constructor(container) {
    this.container = container;
  }

  renderStories(stories) {
    this.container.innerHTML = stories.map((story) => `
      <div class="story-item">
        <img src="${story.photoUrl}" alt="Photo of ${story.title}" />
        <p>${story.description}</p>
        <p>By: ${story.author}</p>
      </div>
    `).join('');
  }

  renderError(message) {
    this.container.innerHTML = `<p class="error">${message}</p>`;
  }
}

class View {
  constructor() {
    this.pageAnimationConfig = {
      duration: 300,
      easing: 'ease-in-out',
      iterations: 1
    };
  }

  async updateContent(content) {
    if (!document.startViewTransition) {
      const app = document.querySelector('#app');
      // Fallback animation using Web Animation API
      const fadeOut = app.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(20px)' }
      ], this.pageAnimationConfig);

      await fadeOut.finished;
      app.innerHTML = content;

      const fadeIn = app.animate([
        { opacity: 0, transform: 'translateY(-20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], this.pageAnimationConfig);

      return fadeIn.finished;
    }

    return document.startViewTransition(() => {
      const app = document.querySelector('#app');
      app.innerHTML = content;
      
      // Add custom animations for view transitions
      document.documentElement.style.setProperty('--page-transition-duration', '0.3s');
      document.documentElement.style.setProperty('--page-transition-easing', 'cubic-bezier(0.4, 0, 0.2, 1)');
      
      // Animate the new page view
      const newPage = app.firstElementChild;
      if (newPage) {
        newPage.animate([
          { transform: 'scale(0.95)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 }
        ], {
          duration: 300,
          easing: 'ease-out',
          fill: 'forwards'
        });
      }
    }).finished;
  }

  getLoginTemplate() {
    return `
      <div class="auth-form" view-transition-name="page">
        <h2>Login</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
          <p>Don't have an account? <a href="#/register">Register here</a></p>
        </form>
      </div>
    `;
  }

  getRegisterTemplate() {
    return `
      <div class="auth-form" view-transition-name="page">
        <h2>Register</h2>
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="8">
          </div>
          <button type="submit">Register</button>
          <p>Already have an account? <a href="#/login">Login here</a></p>
        </form>
      </div>
    `;
  }

  getStoryDetailTemplate(story) {
    return `
      <article class="story-detail" view-transition-name="page" role="article">
        <img src="${story.photoUrl}" 
             alt="Full image for ${story.name}'s story" 
             class="story-detail-image">
        <div class="story-detail-content">
          <h2>${story.name}'s Story</h2>
          <p class="story-description">${story.description}</p>
          <div class="story-meta" role="contentinfo">
            <p>Created at: ${new Date(story.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
        <div id="detail-map" 
             class="story-map" 
             style="height: 300px; margin-top: 20px;"
             role="complementary" 
             aria-label="Location map for ${story.name}'s story"></div>
      </article>
    `;
  }

  getStoryListTemplate(stories) {
    if (!stories.length) {
      return '<div class="stories-empty" view-transition-name="page" role="alert">No stories available</div>';
    }

    return `
      <div class="stories-grid" view-transition-name="page" role="main" aria-label="Stories list">
        ${stories.map((story) => `
          <article class="story-card" data-story-id="${story.id}" tabindex="0" role="article">
            <img src="${story.photoUrl}" alt="Photo for ${story.name}'s story" class="story-image">
            <div class="story-content">
              <h3>${story.name}</h3>
              <p class="story-description">${story.description.substring(0, 150)}${story.description.length > 150 ? '...' : ''}</p>
              <div class="story-meta">
                <p>Posted: ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
            <div id="map-${story.id}" 
                 class="story-map" 
                 style="height: 200px; margin-top: 10px;"
                 role="complementary" 
                 aria-label="Location map for ${story.name}'s story"></div>
          </article>
        `).join('')}
      </div>
    `;
  }

  async showLoading() {
    await this.updateContent(
      '<div class="loading" view-transition-name="page" role="alert" aria-live="polite">Loading...</div>'
    );
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');
    errorDiv.textContent = message;
    document.querySelector('#app').prepend(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
}

// Add CSS Custom Properties for transitions
const style = document.createElement('style');
style.textContent = `
  ::view-transition-old(page),
  ::view-transition-new(page) {
    animation-duration: var(--page-transition-duration);
    animation-timing-function: var(--page-transition-easing);
  }

  ::view-transition-old(page) {
    animation: exit-animation var(--page-transition-duration) var(--page-transition-easing);
  }

  ::view-transition-new(page) {
    animation: enter-animation var(--page-transition-duration) var(--page-transition-easing);
  }

  @keyframes exit-animation {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-10%); }
  }

  @keyframes enter-animation {
    from { opacity: 0; transform: translateX(10%); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);

export { StoryView, View };
