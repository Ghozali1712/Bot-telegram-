// User Tracking Implementation

// Inisialisasi data pengguna
let users = [];
let featureUsage = {};

// Fungsi untuk membuat ID unik
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Fungsi untuk mendapatkan atau membuat ID pengguna
function getUserId() {
    let userId = localStorage.getItem('userId');
    
    // Jika belum ada ID pengguna, buat baru
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('userId', userId);
        
        // Simpan informasi pengguna baru
        const newUser = {
            id: userId,
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visits: 1,
            features: {}
        };
        
        users.push(newUser);
        saveUserData();
    } else {
        // Update informasi pengguna yang sudah ada
        updateUserVisit(userId);
    }
    
    return userId;
}

// Fungsi untuk memperbarui kunjungan pengguna
function updateUserVisit(userId) {
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].lastVisit = new Date().toISOString();
        users[userIndex].visits += 1;
        saveUserData();
    } else {
        // Jika data pengguna tidak ditemukan, buat baru
        const newUser = {
            id: userId,
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visits: 1,
            features: {}
        };
        
        users.push(newUser);
        saveUserData();
    }
}

// Fungsi untuk melacak penggunaan fitur
function trackFeatureUsage(featureName) {
    const userId = getUserId();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        // Update penggunaan fitur untuk pengguna ini
        if (!users[userIndex].features[featureName]) {
            users[userIndex].features[featureName] = 0;
        }
        users[userIndex].features[featureName] += 1;
        
        // Update total penggunaan fitur
        if (!featureUsage[featureName]) {
            featureUsage[featureName] = 0;
        }
        featureUsage[featureName] += 1;
        
        saveUserData();
    }
}

// Fungsi untuk menyimpan data pengguna ke localStorage
function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(users));
    localStorage.setItem('featureUsage', JSON.stringify(featureUsage));
}

// Fungsi untuk memuat data pengguna dari localStorage
function loadUserData() {
    const userData = localStorage.getItem('userData');
    const featureData = localStorage.getItem('featureUsage');
    
    if (userData) {
        users = JSON.parse(userData);
    }
    
    if (featureData) {
        featureUsage = JSON.parse(featureData);
    }
}

// Fungsi untuk mendapatkan daftar pengguna unik
function getUniqueUsers() {
    return users;
}

// Fungsi untuk mendapatkan statistik penggunaan fitur
function getFeatureUsageStats() {
    return featureUsage;
}

// Fungsi untuk mendapatkan fitur yang paling sering digunakan
function getMostUsedFeatures() {
    return Object.entries(featureUsage)
        .sort((a, b) => b[1] - a[1])
        .map(([feature, count]) => ({ feature, count }));
}

// Fungsi untuk mendapatkan pengguna yang paling aktif
function getMostActiveUsers() {
    return [...users]
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10); // Ambil 10 pengguna teratas
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    getUserId(); // Mendapatkan atau membuat ID pengguna
    
    // Lacak halaman yang dikunjungi
    trackFeatureUsage(window.location.pathname);
});

// Ekspor fungsi untuk digunakan di script lain
window.UserTracking = {
    trackFeatureUsage: trackFeatureUsage,
    getUniqueUsers: getUniqueUsers,
    getFeatureUsageStats: getFeatureUsageStats,
    getMostUsedFeatures: getMostUsedFeatures,
    getMostActiveUsers: getMostActiveUsers
};