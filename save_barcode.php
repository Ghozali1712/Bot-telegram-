<?php
// Fungsi untuk menyimpan data ke file JSON
function saveToJson($data, $filename) {
    // Pastikan data valid
    if (empty($data)) {
        return ['success' => false, 'message' => 'Data kosong'];
    }
    
    // Encode data ke format JSON dengan format yang mudah dibaca
    $jsonData = json_encode($data, JSON_PRETTY_PRINT);
    
    // Tulis ke file
    if (file_put_contents($filename, $jsonData)) {
        return ['success' => true, 'message' => 'Data berhasil disimpan'];
    } else {
        return ['success' => false, 'message' => 'Gagal menyimpan data'];
    }
}

// Fungsi untuk menambahkan data baru ke file JSON yang sudah ada
function tambahData($newData, $filename) {
    // Pastikan file ada
    if (!file_exists($filename)) {
        return ['success' => false, 'message' => 'File tidak ditemukan', 'berhasilDitambah' => [], 'gagalDitambah' => []];
    }
    
    // Baca file JSON yang ada
    $jsonContent = file_get_contents($filename);
    $data = json_decode($jsonContent, true);
    
    if (!$data || !isset($data['barcodesheet'])) {
        $data = ['barcodesheet' => []];
    }
    
    $berhasilDitambah = [];
    $gagalDitambah = [];
    
    // Proses setiap entri baru
    foreach ($newData as $entry) {
        $parts = explode(',', $entry);
        if (count($parts) !== 2) {
            $gagalDitambah[] = $entry;
            continue;
        }
        
        $plu = trim($parts[0]);
        $barcode = trim($parts[1]);
        
        // Validasi data
        if (empty($plu) || empty($barcode)) {
            $gagalDitambah[] = $entry;
            continue;
        }
        
        // Cek apakah PLU sudah ada
        $pluExists = false;
        foreach ($data['barcodesheet'] as $item) {
            if ($item['plu'] == $plu) {
                $pluExists = true;
                break;
            }
        }
        
        if ($pluExists) {
            $gagalDitambah[] = $entry;
            continue;
        }
        
        // Tambahkan data baru
        $data['barcodesheet'][] = [
            'plu' => (int)$plu,
            'barcode' => $barcode
        ];
        
        $berhasilDitambah[] = "PLU: $plu, Barcode: $barcode";
    }
    
    // Simpan data yang sudah diupdate
    $jsonData = json_encode($data, JSON_PRETTY_PRINT);
    if (file_put_contents($filename, $jsonData)) {
        return [
            'success' => true, 
            'message' => 'Data berhasil ditambahkan', 
            'berhasilDitambah' => $berhasilDitambah, 
            'gagalDitambah' => $gagalDitambah
        ];
    } else {
        return [
            'success' => false, 
            'message' => 'Gagal menyimpan data', 
            'berhasilDitambah' => [], 
            'gagalDitambah' => $newData
        ];
    }
}

// Terima request POST dengan data JSON
$postData = file_get_contents('php://input');
$request = json_decode($postData, true);

// Set header response sebagai JSON
header('Content-Type: application/json');

// Cek apakah request valid
if (!$request || !isset($request['action'])) {
    echo json_encode(['success' => false, 'message' => 'Request tidak valid']);
    exit;
}

// Proses berdasarkan action
switch ($request['action']) {
    case 'save_barcode':
        // Pastikan data barcode ada
        if (!isset($request['data']) || !isset($request['data']['barcodesheet'])) {
            echo json_encode(['success' => false, 'message' => 'Data barcode tidak valid']);
            exit;
        }
        
        // Simpan data ke file barcode.json
        $result = saveToJson($request['data'], 'barcode.json');
        echo json_encode($result);
        break;
        
    case 'add_single_barcode':
        // Pastikan data PLU dan barcode ada
        if (!isset($request['plu']) || !isset($request['barcode'])) {
            echo json_encode(['success' => false, 'message' => 'Data PLU atau barcode tidak valid']);
            exit;
        }
        
        $plu = $request['plu'];
        $barcode = $request['barcode'];
        
        // Baca file JSON yang ada
        if (!file_exists('barcode.json')) {
            echo json_encode(['success' => false, 'message' => 'File barcode.json tidak ditemukan']);
            exit;
        }
        
        $jsonContent = file_get_contents('barcode.json');
        $data = json_decode($jsonContent, true);
        
        if (!$data || !isset($data['barcodesheet'])) {
            $data = ['barcodesheet' => []];
        }
        
        // Cek apakah PLU sudah ada
        $pluExists = false;
        foreach ($data['barcodesheet'] as $item) {
            if ($item['plu'] == $plu) {
                $pluExists = true;
                break;
            }
        }
        
        if ($pluExists) {
            echo json_encode(['success' => false, 'message' => "PLU $plu sudah ada dalam database"]);
            exit;
        }
        
        // Tambahkan data baru
        $data['barcodesheet'][] = [
            'plu' => (int)$plu,
            'barcode' => $barcode
        ];
        
        // Simpan data yang sudah diupdate
        $jsonData = json_encode($data, JSON_PRETTY_PRINT);
        if (file_put_contents('barcode.json', $jsonData)) {
            echo json_encode(['success' => true, 'message' => "Data berhasil ditambahkan: PLU $plu - Barcode $barcode"]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data']);
        }
        break;
        
    case 'edit_barcode':
        // Pastikan data PLU lama, PLU baru, dan barcode ada
        if (!isset($request['old_plu']) || !isset($request['new_plu']) || !isset($request['barcode'])) {
            echo json_encode(['success' => false, 'message' => 'Data tidak lengkap untuk mengedit']);
            exit;
        }
        
        $oldPlu = $request['old_plu'];
        $newPlu = $request['new_plu'];
        $barcode = $request['barcode'];
        
        // Baca file JSON yang ada
        if (!file_exists('barcode.json')) {
            echo json_encode(['success' => false, 'message' => 'File barcode.json tidak ditemukan']);
            exit;
        }
        
        $jsonContent = file_get_contents('barcode.json');
        $data = json_decode($jsonContent, true);
        
        if (!$data || !isset($data['barcodesheet'])) {
            echo json_encode(['success' => false, 'message' => 'Data barcode tidak valid']);
            exit;
        }
        
        // Cek apakah PLU baru sudah ada (jika berbeda dengan PLU lama)
        if ($oldPlu != $newPlu) {
            $pluExists = false;
            foreach ($data['barcodesheet'] as $item) {
                if ($item['plu'] == $newPlu) {
                    $pluExists = true;
                    break;
                }
            }
            
            if ($pluExists) {
                echo json_encode(['success' => false, 'message' => "PLU $newPlu sudah ada dalam database"]);
                exit;
            }
        }
        
        // Cari dan update data
        $found = false;
        foreach ($data['barcodesheet'] as $key => $item) {
            if ($item['plu'] == $oldPlu) {
                $data['barcodesheet'][$key] = [
                    'plu' => (int)$newPlu,
                    'barcode' => $barcode
                ];
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            echo json_encode(['success' => false, 'message' => "PLU $oldPlu tidak ditemukan dalam database"]);
            exit;
        }
        
        // Simpan data yang sudah diupdate
        $jsonData = json_encode($data, JSON_PRETTY_PRINT);
        if (file_put_contents('barcode.json', $jsonData)) {
            echo json_encode(['success' => true, 'message' => "Data berhasil diperbarui: PLU $newPlu - Barcode $barcode"]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data']);
        }
        break;
        
    case 'delete_barcode':
        // Pastikan data PLU ada
        if (!isset($request['plu'])) {
            echo json_encode(['success' => false, 'message' => 'PLU tidak valid']);
            exit;
        }
        
        $plu = $request['plu'];
        
        // Baca file JSON yang ada
        if (!file_exists('barcode.json')) {
            echo json_encode(['success' => false, 'message' => 'File barcode.json tidak ditemukan']);
            exit;
        }
        
        $jsonContent = file_get_contents('barcode.json');
        $data = json_decode($jsonContent, true);
        
        if (!$data || !isset($data['barcodesheet'])) {
            echo json_encode(['success' => false, 'message' => 'Data barcode tidak valid']);
            exit;
        }
        
        // Cari dan hapus data
        $found = false;
        foreach ($data['barcodesheet'] as $key => $item) {
            if ($item['plu'] == $plu) {
                unset($data['barcodesheet'][$key]);
                // Reindex array setelah menghapus elemen
                $data['barcodesheet'] = array_values($data['barcodesheet']);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            echo json_encode(['success' => false, 'message' => "PLU $plu tidak ditemukan dalam database"]);
            exit;
        }
        
        // Simpan data yang sudah diupdate
        $jsonData = json_encode($data, JSON_PRETTY_PRINT);
        if (file_put_contents('barcode.json', $jsonData)) {
            echo json_encode(['success' => true, 'message' => "Data dengan PLU $plu berhasil dihapus"]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data']);
        }
        break;
        
    case 'save_not_found':
        // Pastikan data not_found_plus ada
        if (!isset($request['data']) || !isset($request['data']['not_found_plus'])) {
            echo json_encode(['success' => false, 'message' => 'Data PLU tidak ditemukan tidak valid']);
            exit;
        }
        
        // Simpan data ke file not_found_plus.json
        $result = saveToJson($request['data'], 'not_found_plus.json');
        echo json_encode($result);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
        break;
}
?>