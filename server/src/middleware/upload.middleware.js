const multer = require('multer');
const path = require('path');

/**
 * Local-disk storage for dev/demo purposes.
 *
 * Swap this for a Cloudinary/S3 upload before deploying:
 *   - switch to multer.memoryStorage()
 *   - in the controller, stream req.files[i].buffer to Cloudinary/S3
 *   - store the returned CDN URLs on complaint.mediaUrls instead of local paths
 * Local disk storage does not survive redeploys on most hosting platforms.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_MIME_PREFIXES = ['image/', 'video/'];

function fileFilter(req, file, cb) {
  const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));
  if (!isAllowed) {
    return cb(new Error('Only image and video files are allowed'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 5, // max 5 files per complaint
  },
});

module.exports = upload;
