const router = require("express").Router();

const {
  login,
  signup,
  upload,
  editUserStatus,
} = require("../controllers/auth");
const { uploadHelper } = require("../helper/UploadHelper");

router.post("/login", login);
router.post("/signup", signup);
router.post("/upload", uploadHelper.single("file"), upload);
router.post("/status/edit", editUserStatus);
// "/:id";

module.exports = router;
