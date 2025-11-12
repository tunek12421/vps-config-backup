// Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : `${window.location.protocol}//${window.location.hostname}/api`;

// State
let reportData = {
    photo: null,
    photoURL: null,
    description: '',
    location: null
};

let map = null;
let marker = null;
let currentLocationMethod = 'auto';

// Current view tracking
let currentView = 'viewHome';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    showView('viewHome');
});

function initializeApp() {
    // Home buttons
    document.getElementById('btnStartReport').addEventListener('click', startNewReport);
    document.getElementById('btnLogin').addEventListener('click', () => {
        alert('Función de inicio de sesión próximamente');
    });

    // Photo view
    document.getElementById('btnTakePhoto').addEventListener('click', () => {
        document.getElementById('photoInput').click();
    });
    document.getElementById('photoInput').addEventListener('change', handlePhotoSelect);
    document.getElementById('btnRetakePhoto').addEventListener('click', () => {
        document.getElementById('photoInput').click();
    });
    document.getElementById('btnCancelPhoto').addEventListener('click', cancelReport);
    document.getElementById('btnNextPhoto').addEventListener('click', () => showView('viewDescription'));

    // Description view
    document.getElementById('description').addEventListener('input', handleDescriptionInput);
    document.getElementById('btnBackDescription').addEventListener('click', () => showView('viewPhoto'));
    document.getElementById('btnNextDescription').addEventListener('click', () => showView('viewLocation'));

    // Location view
    document.getElementById('btnAutoLocation').addEventListener('click', () => switchLocationMethod('auto'));
    document.getElementById('btnMapLocation').addEventListener('click', () => switchLocationMethod('map'));
    document.getElementById('btnGetLocation').addEventListener('click', getCurrentLocation);
    document.getElementById('btnBackLocation').addEventListener('click', () => showView('viewDescription'));
    document.getElementById('btnNextLocation').addEventListener('click', () => showView('viewConfirm'));

    // Confirm view
    document.getElementById('btnBackConfirm').addEventListener('click', () => showView('viewLocation'));
    document.getElementById('btnSubmit').addEventListener('click', handleSubmit);

    // Success view
    document.getElementById('btnNewReport').addEventListener('click', startNewReport);
    document.getElementById('btnGoHome').addEventListener('click', () => showView('viewHome'));

    // PWA Install
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const dismissInstallBtn = document.getElementById('dismissInstall');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installPrompt.style.display = 'block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            installPrompt.style.display = 'none';
        }
    });

    dismissInstallBtn.addEventListener('click', () => {
        installPrompt.style.display = 'none';
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
}

// View Navigation
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });

    // Show target view
    document.getElementById(viewId).style.display = 'block';
    currentView = viewId;

    // Special handling for certain views
    if (viewId === 'viewConfirm') {
        populateConfirmationView();
    }

    if (viewId === 'viewLocation' && !map) {
        setTimeout(initializeMap, 100);
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

function startNewReport() {
    // Reset report data
    reportData = {
        photo: null,
        photoURL: null,
        description: '',
        location: null
    };

    // Reset photo
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('btnTakePhoto').style.display = 'block';
    document.getElementById('btnNextPhoto').disabled = true;

    // Reset description
    document.getElementById('description').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('btnNextDescription').disabled = true;

    // Reset location
    document.getElementById('locationStatus').textContent = '';
    document.getElementById('mapStatus').textContent = '';
    document.getElementById('btnNextLocation').disabled = true;
    if (marker && map) {
        map.removeLayer(marker);
        marker = null;
    }

    // Go to photo view
    showView('viewPhoto');
}

function cancelReport() {
    showConfirmModal(
        'Cancelar reporte',
        '¿Seguro que quieres cancelar este reporte? Se perderán todos los datos ingresados.',
        () => {
            showView('viewHome');
        }
    );
}

// Photo Handling
function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 10MB.');
        return;
    }

    reportData.photo = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        reportData.photoURL = e.target.result;
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('photoPreviewContainer').style.display = 'block';
        document.getElementById('btnTakePhoto').style.display = 'none';
        document.getElementById('btnNextPhoto').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Description Handling
function handleDescriptionInput(event) {
    const text = event.target.value;
    const charCount = text.length;

    document.getElementById('charCount').textContent = charCount;
    reportData.description = text;

    // Enable next button if description has at least 10 characters
    document.getElementById('btnNextDescription').disabled = charCount < 10;
}

// Location Handling
function switchLocationMethod(method) {
    currentLocationMethod = method;

    // Toggle button active states
    document.getElementById('btnAutoLocation').classList.toggle('active', method === 'auto');
    document.getElementById('btnMapLocation').classList.toggle('active', method === 'map');

    // Toggle containers
    document.getElementById('autoLocationContainer').style.display = method === 'auto' ? 'block' : 'none';
    document.getElementById('mapLocationContainer').style.display = method === 'map' ? 'block' : 'none';

    // Initialize map if switching to map mode
    if (method === 'map' && !map) {
        initializeMap();
    }
}

function initializeMap() {
    if (map) return;

    // Default to Cochabamba, Bolivia
    const defaultLat = -17.3935;
    const defaultLng = -66.1570;

    map = L.map('map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Handle map clicks
    map.on('click', (e) => {
        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

        reportData.location = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
        };

        document.getElementById('mapStatus').innerHTML = `
            ✓ Ubicación seleccionada<br>
            📍 ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}
        `;
        document.getElementById('mapStatus').className = 'location-status success';
        document.getElementById('btnNextLocation').disabled = false;
    });
}

function getCurrentLocation() {
    const statusEl = document.getElementById('locationStatus');

    if (!navigator.geolocation) {
        statusEl.textContent = '❌ Tu navegador no soporta geolocalización';
        statusEl.className = 'location-status error';
        return;
    }

    statusEl.textContent = '📍 Obteniendo ubicación...';
    statusEl.className = 'location-status';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            reportData.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            statusEl.innerHTML = `
                ✓ Ubicación obtenida<br>
                📍 ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}
            `;
            statusEl.className = 'location-status success';
            document.getElementById('btnNextLocation').disabled = false;
        },
        (error) => {
            let errorMessage = '❌ No se pudo obtener tu ubicación. ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permiso denegado.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Posición no disponible.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tiempo de espera agotado.';
                    break;
            }

            statusEl.textContent = errorMessage;
            statusEl.className = 'location-status error';
        }
    );
}

// Confirmation View
function populateConfirmationView() {
    // Photo
    document.getElementById('confirmPhoto').src = reportData.photoURL;

    // Description
    document.getElementById('confirmDescription').textContent = reportData.description;

    // Location
    const loc = reportData.location;
    document.getElementById('confirmLocation').innerHTML = `
        Latitud: ${loc.latitude.toFixed(6)}<br>
        Longitud: ${loc.longitude.toFixed(6)}
    `;
}

// Submit Report
async function handleSubmit() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const submitBtn = document.getElementById('btnSubmit');

    loadingIndicator.style.display = 'block';
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('photo', reportData.photo);
        formData.append('description', reportData.description);
        formData.append('latitude', reportData.location.latitude);
        formData.append('longitude', reportData.location.longitude);

        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al enviar el reporte');
        }

        // Success
        showView('viewSuccess');

    } catch (error) {
        console.error('Error submitting report:', error);
        alert(`Error al enviar el reporte: ${error.message}`);
        submitBtn.disabled = false;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Utilities
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Confirmation Modal
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const btnConfirm = document.getElementById('modalConfirm');
    const btnCancel = document.getElementById('modalCancel');

    // Set content
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Show modal
    modal.style.display = 'flex';

    // Handle confirm
    const handleConfirm = () => {
        modal.style.display = 'none';
        if (onConfirm) onConfirm();
        cleanup();
    };

    // Handle cancel
    const handleCancel = () => {
        modal.style.display = 'none';
        cleanup();
    };

    // Handle click outside modal
    const handleOverlayClick = (e) => {
        if (e.target === modal) {
            handleCancel();
        }
    };

    // Cleanup function
    const cleanup = () => {
        btnConfirm.removeEventListener('click', handleConfirm);
        btnCancel.removeEventListener('click', handleCancel);
        modal.removeEventListener('click', handleOverlayClick);
    };

    // Add event listeners
    btnConfirm.addEventListener('click', handleConfirm);
    btnCancel.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleOverlayClick);
}
