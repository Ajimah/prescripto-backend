import express from "express";
import { addDoctor, allDoctors, LoginAdmin,appointmentAdmin, appointmentCancel , adminDashboard } from "../controller/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import {changeAvailability} from '../controller/doctorController.js'
import { getAllTransactions } from "../controller/userController.js";




const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", LoginAdmin);
adminRouter.post("/all-doctors",authAdmin ,allDoctors);
adminRouter.post("/change-availability",authAdmin ,changeAvailability);
adminRouter.post('/getAllTransactions/',authAdmin, getAllTransactions);
adminRouter.get('/appointments', authAdmin,appointmentAdmin);
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel);
adminRouter.get('/dashboard', authAdmin,adminDashboard )


export default adminRouter


