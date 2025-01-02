import express from "express";
import { addDoctor, allDoctors, LoginAdmin } from "../controller/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import {changeAvailability} from '../controller/doctorController.js'




const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", LoginAdmin);
adminRouter.post("/all-doctors",authAdmin ,allDoctors);
adminRouter.post("/change-availability",authAdmin ,changeAvailability);

export default adminRouter

// import express from "express";
// import { createPost, deletePost, getAllPosts, getSinglePost, likeUnlikePost, replyToPost } from "../../controllers/post.controller.js";
// import protectRoute from "../../middlewares/protectRoute.js";
// import upload from "../../config/multer.js";
// const router = express.Router()

// router.post("/add", protectRoute, upload.single('img'), createPost);
