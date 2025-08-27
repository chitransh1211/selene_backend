import multer from 'multer';

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp'); // Define your destination folder
  },
  filename: (req, file, cb) => {
    console.log('File received in multer:', file);

    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload middleware
const upload = multer({ storage });

export default upload;
