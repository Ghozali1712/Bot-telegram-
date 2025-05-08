const fs = require('fs');

// PLU yang ingin dicek
const pluToCheck = ['10010074', '10010092'];

// Fungsi check untuk memeriksa dalam berbagai format
function checkPluInData(data, plu) {
    // Periksa sebagai string dan sebagai number
    const pluAsString = plu;
    const pluAsNumber = parseInt(plu, 10);
    
    // Cari dengan berbagai metode
    const foundAsExactString = data.find(item => item.plu === pluAsString);
    const foundAsExactNumber = data.find(item => item.plu === pluAsNumber);
    const foundAsNumberString = data.find(item => item.plu === pluAsNumber.toString());
    
    // Juga cari dengan perbandingan loose
    const foundWithLooseComparison = data.find(item => {
        if (item.plu == pluAsString || item.plu == pluAsNumber) return true;
        return false;
    });
    
    // Cari dengan metode alternatif jika ada kunci lain
    const foundInOtherField = data.find(item => 
        item.barcode === pluAsString || 
        item.kode === pluAsString || 
        item.code === pluAsString ||
        item.id === pluAsString
    );
    
    if (foundAsExactString) return { found: true, method: 'string exact', data: foundAsExactString };
    if (foundAsExactNumber) return { found: true, method: 'number exact', data: foundAsExactNumber };
    if (foundAsNumberString) return { found: true, method: 'number as string', data: foundAsNumberString };
    if (foundWithLooseComparison) return { found: true, method: 'loose comparison', data: foundWithLooseComparison };
    if (foundInOtherField) return { found: true, method: 'other field', data: foundInOtherField };
    
    return { found: false };
}

// Membaca file barcode (3).json
try {
    console.log('Mencari di file barcode (3).json (file utama)...');
    const mainFile = fs.readFileSync('barcode (3).json', 'utf8');
    const mainData = JSON.parse(mainFile);
    
    console.log(`Jumlah data di file utama: ${mainData.length}`);
    
    // Cek sampel data untuk memahami struktur
    console.log('Contoh struktur data di file utama:');
    if (mainData.length > 0) {
        console.log(JSON.stringify(mainData[0], null, 2));
    }
    
    // Cek PLU
    for (const plu of pluToCheck) {
        const result = checkPluInData(mainData, plu);
        if (result.found) {
            console.log(`PLU ${plu} DITEMUKAN di file utama dengan metode ${result.method}:`, result.data);
        } else {
            console.log(`PLU ${plu} TIDAK DITEMUKAN di file utama`);
        }
    }
} catch (err) {
    console.error('Error membaca file utama:', err.message);
}

// Membaca file barcode.json
try {
    console.log('\nMencari di file barcode.json (file kedua)...');
    const secondaryFile = fs.readFileSync('barcode.json', 'utf8');
    const secondaryData = JSON.parse(secondaryFile);
    
    // Cek struktur data dalam file
    console.log('Struktur file kedua:', Object.keys(secondaryData));
    
    // Cek apakah data dalam array atau object
    let dataArray;
    if (Array.isArray(secondaryData)) {
        dataArray = secondaryData;
    } else if (secondaryData.barcodesheet && Array.isArray(secondaryData.barcodesheet)) {
        dataArray = secondaryData.barcodesheet;
    } else {
        // Periksa kemungkinan kunci lain
        const possibleArrays = Object.values(secondaryData).filter(v => Array.isArray(v));
        if (possibleArrays.length > 0) {
            dataArray = possibleArrays[0];
            console.log(`Menggunakan array dari kunci: ${Object.keys(secondaryData).find(k => Array.isArray(secondaryData[k]))}`);
        } else {
            dataArray = [];
            console.error('Tidak dapat menemukan array data dalam file kedua');
        }
    }
    
    console.log(`Jumlah data di file kedua: ${dataArray.length}`);
    
    // Cek sampel data untuk memahami struktur
    console.log('Contoh struktur data di file kedua:');
    if (dataArray.length > 0) {
        console.log(JSON.stringify(dataArray[0], null, 2));
    }
    
    // Periksa semua plu yang dicari
    for (const plu of pluToCheck) {
        const result = checkPluInData(dataArray, plu);
        if (result.found) {
            console.log(`PLU ${plu} DITEMUKAN di file kedua dengan metode ${result.method}:`, result.data);
        } else {
            console.log(`PLU ${plu} TIDAK DITEMUKAN di file kedua`);
            
            // Coba cari secara manual dalam array
            console.log(`Mencoba mencari PLU ${plu} secara manual dalam 10 data pertama...`);
            let found = false;
            for (let i = 0; i < Math.min(dataArray.length, 10); i++) {
                const item = dataArray[i];
                console.log(`Data #${i}:`, item);
                
                if (item.plu == plu || 
                    (item.barcode && item.barcode.includes(plu)) || 
                    JSON.stringify(item).includes(plu)) {
                    console.log(`Kemungkinan cocok ditemukan dalam data #${i}:`, item);
                    found = true;
                }
            }
            
            if (!found) console.log(`Tidak ada kecocokan PLU ${plu} dalam sampel data`);
            
            // Coba cari eksplisit dengan string
            console.log(`\nMencari "${plu}" dalam file JSON mentah...`);
            if (secondaryFile.includes(`"${plu}"`) || secondaryFile.includes(`${plu}`)) {
                console.log(`String "${plu}" DITEMUKAN dalam file tapi mungkin bukan sebagai PLU`);
                
                // Coba temukan konteks seputar string yang ditemukan
                const index = secondaryFile.indexOf(plu);
                if (index !== -1) {
                    const start = Math.max(0, index - 50);
                    const end = Math.min(secondaryFile.length, index + 50);
                    console.log(`Konteks: ${secondaryFile.substring(start, end)}`);
                }
            } else {
                console.log(`String "${plu}" tidak ditemukan dalam file JSON mentah`);
            }
        }
    }
} catch (err) {
    console.error('Error membaca file kedua:', err.message);
} 