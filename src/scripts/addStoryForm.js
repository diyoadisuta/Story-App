import storyDB from './indexedDB.js';

class AddStoryForm {
  constructor(container, model) {
    this.container = container;
    this.model = model;
    this.map = null;
    this.marker = null;
    this.stream = null;
  }

  renderForm() {
    const isGuest = !this.model.isLoggedIn();
    this.container.innerHTML = `
      <div class="page-transition">
        <div class="auth-form">
          <h2>${isGuest ? 'Add Guest Story' : 'Add Story'}</h2>
          <form id="add-story-form">
            <div class="form-group">
              <label for="description">Description:</label>
              <textarea id="description" name="description" required></textarea>
            </div>

            <div class="form-group">
              <label>Photo:</label>
              <div class="camera-container">
                <video id="camera-preview" autoplay playsinline style="display: none;"></video>
                <canvas id="camera-canvas" style="display: none;"></canvas>
                <div class="camera-controls">
                  <button type="button" id="start-camera" class="camera-button">
                    <span>📸 Start Camera</span>
                  </button>
                  <button type="button" id="capture-photo" class="camera-button" style="display: none;">
                    <span>📸 Capture Photo</span>
                  </button>
                  <button type="button" id="switch-camera" class="camera-button" style="display: none;">
                    <span>🔄 Switch Camera</span>
                  </button>
                </div>
                <div id="preview-container" style="display: none; margin-top: 10px;">
                  <img id="preview-image" style="max-width: 100%; max-height: 300px; object-fit: contain;" />
                  <div class="camera-controls">
                    <button type="button" id="retake-button" class="camera-button">
                      <span>🔄 Retake Photo</span>
                    </button>
                  </div>
                </div>
                <input type="file" id="photo" name="photo" accept="image/*" capture="environment" required style="display: none" />
              </div>
            </div>

            <div id="map" style="height: 300px; margin: 20px 0;" aria-label="Map for selecting location"></div>

            <button type="submit">Submit Story</button>
          </form>
        </div>
      </div>
    `;

    this.initMap();
    this.initCameraControls();
    this.handleFormSubmit();
    
    // Activate transition
    requestAnimationFrame(() => {
      const element = document.querySelector('.page-transition');
      if (element) {
        element.classList.add('active');
      }
    });
  }

  async initCameraControls() {
    const startButton = document.getElementById('start-camera');
    const captureButton = document.getElementById('capture-photo');
    const switchButton = document.getElementById('switch-camera');
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const retakeButton = document.getElementById('retake-button');
    const photoInput = document.getElementById('photo');

    let currentFacingMode = 'environment';

    const startCamera = async (facingMode = currentFacingMode) => {
      try {
        if (this.stream) {
          this.stopCamera();
        }

        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        });

        video.srcObject = this.stream;
        video.style.display = 'block';
        captureButton.style.display = 'block';
        switchButton.style.display = 'block';
        startButton.style.display = 'none';
        previewContainer.style.display = 'none';

        // Set canvas size to match video
        video.addEventListener('loadedmetadata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        });

      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please make sure you have granted camera permissions.');
      }
    };

    const capturePhoto = () => {
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;

        previewImage.src = canvas.toDataURL('image/jpeg');
        previewContainer.style.display = 'block';
        video.style.display = 'none';
        captureButton.style.display = 'none';
        switchButton.style.display = 'none';
        
        this.stopCamera();
      }, 'image/jpeg');
    };

    startButton.addEventListener('click', () => startCamera());

    switchButton.addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      startCamera(currentFacingMode);
    });

    captureButton.addEventListener('click', capturePhoto);

    retakeButton.addEventListener('click', () => {
      photoInput.value = '';
      startCamera();
    });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  initMap() {
    this.map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }
    });
  }

  async handleFormSubmit() {
    const form = document.getElementById('add-story-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.marker) {
        alert('Please select a location on the map.');
        return;
      }

      const { lat, lng } = this.marker.getLatLng();
      const formData = new FormData();
      const description = document.getElementById('description').value;
      const photo = document.getElementById('photo').files[0];

      formData.append('description', description);
      formData.append('photo', photo);
      formData.append('lat', lat.toString());
      formData.append('lon', lng.toString());

      const isGuest = !this.model.isLoggedIn();

      try {
        // Try to add story to server first
      try {
        await this.model.addStory(formData, isGuest);
          
          // Send push notification
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            const notificationData = {
              title: 'Story berhasil dibuat',
              options: {
                body: `Anda telah membuat story baru dengan deskripsi: ${description}`
              }
            };
            
            await registration.showNotification(notificationData.title, {
              body: notificationData.options.body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              vibrate: [100, 50, 100],
              data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
              },
              actions: [
                {
                  action: 'explore',
                  title: 'Lihat Story',
                  icon: '/icons/icon-72x72.png'
                },
                {
                  action: 'close',
                  title: 'Tutup',
                  icon: '/icons/icon-72x72.png'
                }
              ]
            });
          }
        } catch (error) {
          // If server request fails, save to IndexedDB
          console.log('Server request failed, saving to IndexedDB:', error);
          
          // Convert photo to base64 for storage
          const reader = new FileReader();
          reader.readAsDataURL(photo);
          reader.onloadend = async () => {
            const base64Photo = reader.result;
            
            // Save to IndexedDB
            await storyDB.init();
            await storyDB.addStory({
              description,
              photo: base64Photo,
              lat,
              lon: lng,
              isGuest
            });

            alert('Story saved offline. It will be synced when you are back online.');
          };
        }

        window.location.hash = '#/';
      } catch (error) {
        alert(error.message || 'Failed to add story');
      }
    });
  }
}

export default AddStoryForm;
