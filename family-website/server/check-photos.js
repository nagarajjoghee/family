import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'family.db');

if (!fs.existsSync(DB_PATH)) {
    console.log('Database not found at:', DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

console.log('Checking photos in database...\n');

const photos = db.prepare('SELECT id, title, file_name, file_size, mime_type, LENGTH(file_data) as data_length FROM photos').all();

if (photos.length === 0) {
    console.log('No photos found in database.');
} else {
    console.log(`Found ${photos.length} photo(s):\n`);
    photos.forEach(photo => {
        console.log(`Photo ID: ${photo.id}`);
        console.log(`  Title: ${photo.title || 'Untitled'}`);
        console.log(`  File: ${photo.file_name}`);
        console.log(`  MIME Type: ${photo.mime_type}`);
        console.log(`  File Size: ${photo.file_size} bytes`);
        console.log(`  Data Length: ${photo.data_length} bytes`);
        
        // Check the actual data type
        const photoData = db.prepare('SELECT file_data FROM photos WHERE id = ?').get(photo.id);
        if (photoData && photoData.file_data) {
            const isBuffer = Buffer.isBuffer(photoData.file_data);
            const isUint8Array = photoData.file_data instanceof Uint8Array;
            const dataType = typeof photoData.file_data;
            console.log(`  Data Type: ${dataType}, isBuffer: ${isBuffer}, isUint8Array: ${isUint8Array}`);
            
            // Check first few bytes to see if it looks like an image
            let firstBytes = '';
            if (isBuffer) {
                firstBytes = photoData.file_data.slice(0, 10).toString('hex');
            } else if (isUint8Array) {
                firstBytes = Buffer.from(photoData.file_data).slice(0, 10).toString('hex');
            }
            console.log(`  First 10 bytes (hex): ${firstBytes}`);
            
            // JPEG files start with FF D8 FF
            // PNG files start with 89 50 4E 47
            if (firstBytes.startsWith('ffd8ff')) {
                console.log(`  ✓ Looks like a JPEG file`);
            } else if (firstBytes.startsWith('89504e47')) {
                console.log(`  ✓ Looks like a PNG file`);
            } else {
                console.log(`  ⚠ Warning: Doesn't look like a valid image file`);
            }
        } else {
            console.log(`  ⚠ No file_data found!`);
        }
        console.log('');
    });
}

db.close();

