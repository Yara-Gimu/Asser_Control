// Global variables
let landmarksData = null;
let currentUser = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize page
    initPage();
});

function checkAuth() {
    currentUser = sessionStorage.getItem('adminUser');
    if (!currentUser && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

function setupEventListeners() {
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function initPage() {
    loadLandmarksData().then(() => {
        if (window.location.pathname.includes('dashboard.html')) {
            initDashboard();
        } else if (window.location.pathname.includes('cms.html')) {
            initCMS();
        } else if (window.location.pathname.includes('index.html')) {
            initLogin();
        }
    });
}

// Dashboard Functions
function initDashboard() {
    updateDashboardStats();
    renderCharts();
}

function updateDashboardStats() {
    if (!landmarksData) return;
    
    document.getElementById('totalVisits').textContent = landmarksData.stats.totalVisits.toLocaleString();
    document.getElementById('avgTime').textContent = `${landmarksData.stats.averageTime} دقيقة`;
    
    // Top languages
    const languages = landmarksData.stats.languages;
    const topLanguages = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const languagesHtml = topLanguages.map(([lang, count]) => 
        `<div>${getLanguageName(lang)}: ${count.toLocaleString()}</div>`
    ).join('');
    document.getElementById('topLanguages').innerHTML = languagesHtml;
    
    // Top landmarks
    const topLandmarks = [...landmarksData.landmarks]
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 3);
    
    const landmarksHtml = topLandmarks.map(landmark => 
        `<div>${landmark.name.ar}: ${landmark.visits.toLocaleString()}</div>`
    ).join('');
    document.getElementById('topLandmarks').innerHTML = landmarksHtml;
}

function renderCharts() {
    // Visits by day chart
    renderVisitsChart();
    
    // Language distribution chart
    renderLanguageChart();
}

function renderVisitsChart() {
    const ctx = document.getElementById('visitsChart').getContext('2d');
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const visitsData = days.map(() => Math.floor(Math.random() * 200) + 50);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'عدد الزيارات',
                data: visitsData,
                backgroundColor: 'rgba(42, 92, 74, 0.2)',
                borderColor: 'rgba(42, 92, 74, 1)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 50
                    }
                }
            }
        }
    });
}

function renderLanguageChart() {
    const ctx = document.getElementById('languageChart').getContext('2d');
    const languages = landmarksData.stats.languages;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['العربية', 'الإنجليزية', 'الفرنسية', 'الإسبانية'],
            datasets: [{
                data: [languages.ar, languages.en, languages.fr, languages.es],
                backgroundColor: [
                    'rgba(42, 92, 74, 0.8)',
                    'rgba(212, 175, 55, 0.8)',
                    'rgba(106, 168, 79, 0.8)',
                    'rgba(62, 128, 96, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        }
    });
}

// CMS Functions
function initCMS() {
    renderLandmarksTable();
    
    // Setup CMS event listeners
    document.getElementById('addLandmarkBtn').addEventListener('click', showAddLandmarkForm);
    document.getElementById('searchBtn').addEventListener('click', searchLandmarks);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchLandmarks();
    });
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('deleteLandmarkBtn').addEventListener('click', confirmDeleteLandmark);
    document.getElementById('editLandmarkForm').addEventListener('submit', saveLandmark);
}

function renderLandmarksTable(filter = '') {

    if (!landmarksData) return;
    
    const tableBody = document.querySelector('#landmarksTable tbody');
    tableBody.innerHTML = '';
    
    const filteredLandmarks = landmarksData.landmarks.filter(landmark => 
        landmark.name.ar.includes(filter) || 
        landmark.name.en.toLowerCase().includes(filter.toLowerCase())
    );
    
    filteredLandmarks.forEach(landmark => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${landmark.id}</td>
            <td>${landmark.name.ar}</td>
            <td>${landmark.location.lat}, ${landmark.location.lng}</td>
            <td>${landmark.visits.toLocaleString()}</td>
            <td>${landmark.interactions.toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${landmark.id}">تعديل</button>
                <button class="action-btn delete-btn" data-id="${landmark.id}">حذف</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editLandmark(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            confirmDeleteLandmark(this.getAttribute('data-id'));
        });
    });
}

function searchLandmarks() {
    const searchTerm = document.getElementById('searchInput').value;
    renderLandmarksTable(searchTerm);
}

function showAddLandmarkForm() {
    document.getElementById('formTitle').textContent = 'إضافة معلم جديد';
    document.getElementById('landmarkForm').style.display = 'block';
    document.getElementById('deleteLandmarkBtn').style.display = 'none';
    document.getElementById('editLandmarkForm').reset();
    document.getElementById('landmarkId').value = '';
    document.getElementById('landmarkForm').scrollIntoView({ behavior: 'smooth' });
}

function editLandmark(id) {
    const landmark = landmarksData.landmarks.find(l => l.id === id);
    if (!landmark) return;
    
    document.getElementById('formTitle').textContent = 'تعديل معلم';
    document.getElementById('landmarkForm').style.display = 'block';
    document.getElementById('deleteLandmarkBtn').style.display = 'inline-block';
    
    // Fill form with landmark data
    document.getElementById('landmarkId').value = landmark.id;
    document.getElementById('landmarkNameAr').value = landmark.name.ar;
    document.getElementById('landmarkNameEn').value = landmark.name.en;
    document.getElementById('landmarkNameFr').value = landmark.name.fr;
    document.getElementById('landmarkNameEs').value = landmark.name.es;
    document.getElementById('landmarkLat').value = landmark.location.lat;
    document.getElementById('landmarkLng').value = landmark.location.lng;
    document.getElementById('landmarkDescAr').value = landmark.description.ar;
    document.getElementById('landmarkDescEn').value = landmark.description.en;
    document.getElementById('landmarkDescFr').value = landmark.description.fr;
    document.getElementById('landmarkDescEs').value = landmark.description.es;
    document.getElementById('landmarkRecs').value = landmark.recommendations?.join(', ') || '';
    
    document.getElementById('landmarkForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    document.getElementById('landmarkForm').style.display = 'none';
}

function saveLandmark(e) {
    e.preventDefault();
    
    const id = document.getElementById('landmarkId').value;
    const isNew = id === '';
    
    const landmarkData = {
        id: isNew ? generateNewId() : id,
        name: {
            ar: document.getElementById('landmarkNameAr').value,
            en: document.getElementById('landmarkNameEn').value,
            fr: document.getElementById('landmarkNameFr').value,
            es: document.getElementById('landmarkNameEs').value
        },
        location: {
            lat: parseFloat(document.getElementById('landmarkLat').value),
            lng: parseFloat(document.getElementById('landmarkLng').value),
            google_maps_url: document.getElementById('landmarkMapsUrl')?.value || ''
        },
        description: {
            ar: document.getElementById('landmarkDescAr').value,
            en: document.getElementById('landmarkDescEn').value,
            fr: document.getElementById('landmarkDescFr').value,
            es: document.getElementById('landmarkDescEs').value
        },
        recommendations: document.getElementById('landmarkRecs').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item),
        visits: isNew ? 0 : landmarksData.landmarks.find(l => l.id === id)?.visits || 0,
        interactions: isNew ? 0 : landmarksData.landmarks.find(l => l.id === id)?.interactions || 0
    };
    
    if (isNew) {
        landmarksData.landmarks.push(landmarkData);
    } else {
        const index = landmarksData.landmarks.findIndex(l => l.id === id);
        if (index !== -1) {
            landmarksData.landmarks[index] = landmarkData;
        }
    }
    
    updateLandmarksData();
    renderLandmarksTable();
    cancelEdit();
    
    // Show success message
    alert(`تم ${isNew ? 'إضافة' : 'تحديث'} المعلم بنجاح!`);
}

function confirmDeleteLandmark(id) {
    if (!id) id = document.getElementById('landmarkId').value;
    if (!id) return;
    
    if (confirm('هل أنت متأكد من حذف هذا المعلم؟ لا يمكن التراجع عن هذا الإجراء.')) {
        deleteLandmark(id);
    }
}

function deleteLandmark(id) {
    landmarksData.landmarks = landmarksData.landmarks.filter(l => l.id !== id);
    updateLandmarksData();
    renderLandmarksTable();
    cancelEdit();
    
    // Show success message
    alert('تم حذف المعلم بنجاح!');
}

function generateNewId() {
    if (!landmarksData?.landmarks?.length) return '001';
    
    const ids = landmarksData.landmarks.map(l => parseInt(l.id));
    const maxId = Math.max(...ids);
    return (maxId + 1).toString().padStart(3, '0');
}

// Utility Functions
function loadLandmarksData() {
    // في التطبيق الحقيقي، هنا يتم جلب البيانات من الخادم
    // لأغراض العرض، سنستخدم بيانات وهمية
    return new Promise((resolve) => {
        landmarksData = {
            landmarks: [
                {
                    id: "001",
                    name: {
                        ar: "قرية رجال ألمع التراثية",
                        en: "Rijal Almaa Heritage Village",
                        fr: "Village patrimonial de Rijal Almaa",
                        es: "Pueblo Patrimonial de Rijal Almaa"
                    },
                    location: {
                        lat: 18.2156,
                        lng: 42.5053,
                        google_maps_url: "https://goo.gl/maps/FkjU2dvm3fJtZmRt8"
                    },
                    description: {
                        ar: "قرية تراثية تعود لأكثر من 900 عام، تتميز ببيوتها الحجرية المزخرفة بنقوش القط العسيري.",
                        en: "A heritage village dating back more than 900 years, famous for its stone houses decorated with Asiri cat engravings.",
                        fr: "Un village patrimonial datant de plus de 900 ans, célèbre pour ses maisons en pierre décorées de gravures de chat Asiri.",
                        es: "Un pueblo patrimonial que data de hace más de 900 años, famoso por sus casas de piedra decoradas con grabados de gato Asiri."
                    },
                    recommendations: ["002", "003", "005"],
                    visits: 1250,
                    interactions: 320
                },
                {
                    id: "002",
                    name: {
                        ar: "جبل السودة",
                        en: "Jabal Sawda",
                        fr: "Mont Sawda",
                        es: "Montaña Sawda"
                    },
                    location: {
                        lat: 18.2639,
                        lng: 42.3758,
                        google_maps_url: "https://goo.gl/maps/rkP17Za7ZTkrtp9L6"
                    },
                    description: {
                        ar: "أعلى قمة في السعودية بارتفاع 3000 متر، تتميز بمناظرها الخلابة وطقسها المعتدل صيفاً.",
                        en: "The highest peak in Saudi Arabia at 3000 meters, known for its scenic views and moderate summer weather.",
                        fr: "Le plus haut sommet d'Arabie saoudite à 3000 mètres, connu pour ses vues panoramiques et son temps estival modéré.",
                        es: "El pico más alto de Arabia Saudita con 3000 metros, conocido por sus vistas panorámicas y su clima veraniego moderado."
                    },
                    recommendations: ["001", "004", "006"],
                    visits: 980,
                    interactions: 250
                }
            ],
            stats: {
                totalVisits: 15000,
                languages: {
                    ar: 9000,
                    en: 4000,
                    fr: 1000,
                    es: 1000
                },
                averageTime: 7
            }
        };
        resolve(landmarksData);
    });
}

function updateLandmarksData() {
    console.log('Data would be saved to server:', landmarksData);
    // في التطبيق الحقيقي، هنا يتم حفظ البيانات على الخادم
    
    if (window.location.pathname.includes('dashboard.html')) {
        updateDashboardStats();
        renderCharts();
    }
}

function getLanguageName(code) {
    const languages = {
        'ar': 'العربية',
        'en': 'الإنجليزية',
        'fr': 'الفرنسية',
        'es': 'الإسبانية'
    };
    return languages[code] || code;
}

// Login Functions
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('adminUser', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

function logout() {
    sessionStorage.removeItem('adminUser');
    window.location.href = 'index.html';
}