// Konfigurasi WhatsApp API
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';
const ADMIN_PHONE_NUMBER = '6285733818592'; // Nomor WhatsApp admin (format: 628xxxxxxxxxx)

// Fungsi untuk mengirim notifikasi WhatsApp ke admin
async function sendWhatsAppNotification(notFoundPLUs) {
    if (!ADMIN_PHONE_NUMBER) {
        console.error('Nomor WhatsApp admin belum dikonfigurasi');
        return;
    }

    try {
        const timestamp = new Date().toLocaleString('id-ID');
        const message = `*Notifikasi PLU Tidak Ditemukan*\n\nWaktu: ${timestamp}\nPLU: ${notFoundPLUs.join(', ')}\n\nMohon segera ditindaklanjuti.`;
        
        // Encode pesan untuk URL WhatsApp
        const encodedMessage = encodeURIComponent(message);
        
        // Buat URL WhatsApp dengan pesan yang sudah di-encode
        const whatsappUrl = `${WHATSAPP_API_URL}?phone=${ADMIN_PHONE_NUMBER}&text=${encodedMessage}`;
        
        // Buka WhatsApp di tab baru
        window.open(whatsappUrl, '_blank');
        
        console.log('Notifikasi WhatsApp berhasil dikirim');
    } catch (error) {
        console.error('Gagal mengirim notifikasi WhatsApp:', error);
    }
}