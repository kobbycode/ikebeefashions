import sharp from 'sharp';

async function compressImage() {
  try {
    await sharp('public/lookbook_header.png')
      .resize(1200, 630, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile('public/og_image.jpg');
    console.log('Successfully compressed lookbook_header.png to og_image.jpg');
  } catch (err) {
    console.error('Error compressing image:', err);
  }
}

compressImage();
