// const express = require("express");
// const AuctionController = require("../controllers/auctionController");
// const {
//   authMiddleware,
//   adminMiddleware,
// } = require("../middlewares/authMiddleware");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const router = express.Router();

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, "../../public/uploads/posters");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Configure multer for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir);
//   },
//   filename: function (req, file, cb) {
//     // Generate unique filename
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `poster-${uniqueSuffix}${path.extname(file.originalname)}`);
//   },
// });

// // Improved file filter
// const fileFilter = (req, file, cb) => {
//   // Check file type
//   const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     // Reject file
//     cb(
//       new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."),
//       false
//     );
//   }
// };

// // Configure multer with more options
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB file size limit
//   },
// });

// // Error handling middleware for multer
// const multerErrorHandler = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     // Multer-specific errors
//     return res.status(400).json({
//       message: err.message || "File upload error",
//       error: "MULTER_ERROR",
//     });
//   } else if (err) {
//     // Other errors
//     return res.status(400).json({
//       message: err.message || "File upload failed",
//       error: "FILE_UPLOAD_ERROR",
//     });
//   }
//   next();
// };

// // Protected Routes for Auction Creation
// router.post(
//   "/",
//   authMiddleware, // Ensure user is authenticated
//   upload.single("poster"), // Handle single file upload for poster
//   multerErrorHandler, // Add error handling middleware
//   AuctionController.createAuction
// );

// // ... rest of your routes remain the same

// router.post("/:id/bid", authMiddleware, AuctionController.placeBid);

// router.get(
//   "/user/my-auctions",
//   authMiddleware,
//   AuctionController.getUserAuctions
// );

// // Admin Routes
// router.post(
//   "/close-expired",
//   authMiddleware,
//   adminMiddleware,
//   AuctionController.closeExpiredAuctions
// );

// module.exports = router;

const express = require("express");
const AuctionController = require("../controllers/auctionController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../public/uploads/posters");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `poster-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Improved file filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Reject file
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."),
      false
    );
  }
};

// Configure multer with more options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Multer error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message || "File upload error",
      error: "MULTER_ERROR",
    });
  } else if (err) {
    return res.status(400).json({
      message: err.message || "File upload failed",
      error: "FILE_UPLOAD_ERROR",
    });
  }
  next();
};

// Logging middleware for debugging
const logRequestMiddleware = (req, res, next) => {
  console.log("Incoming Request:", {
    method: req.method,
    path: req.path,
    body: req.body,
    file: req.file,
  });
  next();
};

// Protected Routes for Auction Creation
router.post(
  "/",
  authMiddleware, // Ensure user is authenticated
  logRequestMiddleware, // Add logging middleware
  upload.single("poster"), // Handle single file upload for poster
  multerErrorHandler, // Add error handling middleware
  AuctionController.createAuction
);
// ... rest of your routes remain the same

router.post("/:id/bid", authMiddleware, AuctionController.placeBid);

// router.get(
//   "/user/my-auctions",
//   authMiddleware,
//   AuctionController.getUserAuctions
// );

router.get("/", authMiddleware, AuctionController.getUserAuctions);

router.get("/:id/bids", authMiddleware, AuctionController.getBidHistory);
router.get("/users/:id", authMiddleware, AuctionController.getUser);

// Admin Routes
router.post(
  "/close-expired",
  authMiddleware,
  adminMiddleware,
  AuctionController.closeExpiredAuctions
);

module.exports = router;
