/**
 * AR Viewer — MindAR Scene Controller
 * Handles: loading states, target detection events, click interactions, info panel
 */

// --- A-Frame Custom Component: Click Handler ---
AFRAME.registerComponent('ar-click-handler', {
  schema: {
    action: { type: 'string', default: 'info' },  // 'info', 'animate', 'link'
    url: { type: 'string', default: '' }
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    el.addEventListener('click', () => {
      switch (data.action) {
        case 'info':
          toggleInfoPanel(true);
          pulseElement(el);
          break;

        case 'animate':
          triggerAnimation(el);
          showNotification('✨ Animation triggered!');
          break;

        case 'link':
          if (data.url) {
            showNotification('🌐 Opening link...');
            setTimeout(() => {
              window.open(data.url, '_blank');
            }, 500);
          }
          break;
      }
    });

    // Visual feedback on hover (desktop) / tap
    el.addEventListener('mouseenter', () => {
      const mesh = el.getObject3D('mesh');
      if (mesh && mesh.material) {
        el.setAttribute('material', 'emissiveIntensity', 1.0);
      }
    });

    el.addEventListener('mouseleave', () => {
      const mesh = el.getObject3D('mesh');
      if (mesh && mesh.material) {
        el.setAttribute('material', 'emissiveIntensity', 0.6);
      }
    });
  }
});


// --- DOM Elements ---
const loadingOverlay = document.getElementById('ar-loading');
const scanningOverlay = document.getElementById('ar-scanning');
const notification = document.getElementById('ar-notification');
const infoPanel = document.getElementById('ar-info-panel');
const dismissBtn = document.getElementById('dismiss-info');
const hudStatusDot = document.getElementById('hud-status-dot');
const hudStatusText = document.getElementById('hud-status-text');
const arScene = document.getElementById('ar-scene');

let isTargetVisible = false;
let notificationTimeout = null;

// --- Scene Ready ---
arScene.addEventListener('renderstart', () => {
  // Hide loading overlay once scene is ready
  setTimeout(() => {
    loadingOverlay.classList.add('hidden');
  }, 1500);
});

// --- Multi-Target Handling ---
const targetEntities = document.querySelectorAll('a-entity[mindar-image-target]');
const pageTitles = [
  "Page 1: Cover",
  "Page 2: Our Services",
  "Page 3: Property Showcase",
  "Page 4: Contact Us"
];

targetEntities.forEach((entity, index) => {
  entity.addEventListener('targetFound', () => {
    isTargetVisible = true;
    
    // Hide scanning overlay
    scanningOverlay.classList.add('hidden');

    // Update HUD
    hudStatusDot.classList.remove('scanning');
    hudStatusText.textContent = `Tracking ${pageTitles[index]}`;

    // Show notification
    showNotification(`✅ Detected: ${pageTitles[index]}`);
  });

  entity.addEventListener('targetLost', () => {
    // Check if any OTHER target is still visible (to avoid flickering if possible)
    // but typically MindAR handles one at a time unless maxTrack > 1
    isTargetVisible = false;

    // Show scanning overlay
    scanningOverlay.classList.remove('hidden');

    // Update HUD
    hudStatusDot.classList.add('scanning');
    hudStatusText.textContent = 'Scanning...';

    // Hide info panel
    toggleInfoPanel(false);
  });
});

// --- Info Panel ---
function toggleInfoPanel(show) {
  if (show) {
    infoPanel.classList.add('visible');
  } else {
    infoPanel.classList.remove('visible');
  }
}

dismissBtn.addEventListener('click', () => {
  toggleInfoPanel(false);
});

// Close info panel by tapping the handle
document.querySelector('.ar-info-panel-handle').addEventListener('click', () => {
  toggleInfoPanel(false);
});

// --- Notification ---
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('visible');

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notificationTimeout = setTimeout(() => {
    notification.classList.remove('visible');
  }, 2500);
}

// --- Animation Helpers ---
function pulseElement(el) {
  // Quick scale pulse
  const currentScale = el.getAttribute('scale') || { x: 1, y: 1, z: 1 };
  el.setAttribute('animation__click', {
    property: 'scale',
    to: `${currentScale.x * 1.5} ${currentScale.y * 1.5} ${currentScale.z * 1.5}`,
    dur: 300,
    easing: 'easeOutBack',
    dir: 'alternate',
    loop: 1
  });

  // Remove the animation after it completes
  setTimeout(() => {
    el.removeAttribute('animation__click');
  }, 700);
}

function triggerAnimation(el) {
  // Change color temporarily
  const originalColor = el.getAttribute('material').color;
  el.setAttribute('material', 'color', '#fff');
  el.setAttribute('material', 'emissiveIntensity', 2);

  setTimeout(() => {
    el.setAttribute('material', 'color', originalColor);
    el.setAttribute('material', 'emissiveIntensity', 0.5);
  }, 500);

  // Speed up rotation temporarily
  el.setAttribute('animation', {
    property: 'rotation',
    to: '60 720 0',
    dur: 1500,
    easing: 'easeInOutCubic',
    loop: false
  });

  setTimeout(() => {
    el.setAttribute('animation', {
      property: 'rotation',
      to: '75 360 0',
      dur: 3000,
      easing: 'linear',
      loop: true
    });
  }, 1500);
}

// --- Touch / Click support for A-Frame on mobile ---
// MindAR + A-Frame handle this via the cursor component on a-camera
// but we ensure touch events are properly forwarded
document.addEventListener('touchstart', (e) => {
  // Prevent double-tap zoom on iOS
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// --- Error Handling ---
arScene.addEventListener('arError', (e) => {
  loadingOverlay.querySelector('.ar-loading-text').textContent = 'AR Error';
  loadingOverlay.querySelector('.ar-loading-subtext').textContent = 
    'Could not start AR. Please ensure camera permissions are granted and try again.';
  loadingOverlay.querySelector('.ar-loading-spinner').style.borderTopColor = '#ef4444';
});

// Fallback: if loading takes too long, update the message
setTimeout(() => {
  if (!loadingOverlay.classList.contains('hidden')) {
    loadingOverlay.querySelector('.ar-loading-subtext').innerHTML = 
      'Taking longer than expected...<br/>Please allow camera access in the permission dialog.';
  }
}, 8000);

console.log('📸 BookThatStudio AR Viewer initialized');
