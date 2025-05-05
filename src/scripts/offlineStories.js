import storyDB from './indexedDB.js';

class OfflineStories {
  constructor(container) {
    this.container = container;
  }

  async render() {
    try {
      await storyDB.init();
      const stories = await storyDB.getAllStories();
      
      this.container.innerHTML = `
        <div class="page-transition">
          <div class="offline-stories">
            <h2>Offline Stories</h2>
            ${stories.length === 0 ? 
              '<p class="no-stories">No offline stories available</p>' :
              this._createStoriesList(stories)
            }
          </div>
        </div>
      `;

      this._attachEventListeners();
      
      // Activate transition
      requestAnimationFrame(() => {
        const element = document.querySelector('.page-transition');
        if (element) {
          element.classList.add('active');
        }
      });
    } catch (error) {
      console.error('Error loading offline stories:', error);
      this.container.innerHTML = `
        <div class="error-message">
          <p>Failed to load offline stories. Please try again later.</p>
        </div>
      `;
    }
  }

  _createStoriesList(stories) {
    return `
      <div class="stories-list">
        ${stories.map(story => `
          <div class="story-card" data-id="${story.id}">
            <div class="story-content">
              <p class="story-description">${story.description}</p>
              <p class="story-location">📍 ${story.lat}, ${story.lon}</p>
              <p class="story-date">Created: ${new Date(story.createdAt).toLocaleString()}</p>
            </div>
            <div class="story-actions">
              <button class="delete-story" data-id="${story.id}">Delete</button>
              <button class="sync-story" data-id="${story.id}">Sync</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  _attachEventListeners() {
    // Delete story
    this.container.querySelectorAll('.delete-story').forEach(button => {
      button.addEventListener('click', async (event) => {
        const storyId = parseInt(event.target.dataset.id);
        if (confirm('Are you sure you want to delete this story?')) {
          try {
            await storyDB.deleteStory(storyId);
            await this.render(); // Refresh the list
          } catch (error) {
            console.error('Error deleting story:', error);
            alert('Failed to delete story');
          }
        }
      });
    });

    // Sync story
    this.container.querySelectorAll('.sync-story').forEach(button => {
      button.addEventListener('click', async (event) => {
        const storyId = parseInt(event.target.dataset.id);
        try {
          const story = await storyDB.getStoryById(storyId);
          if (story) {
            // Here you would implement the sync logic with your API
            // For now, we'll just show a message
            alert('Sync functionality will be implemented with the API');
          }
        } catch (error) {
          console.error('Error syncing story:', error);
          alert('Failed to sync story');
        }
      });
    });
  }
}

export default OfflineStories; 