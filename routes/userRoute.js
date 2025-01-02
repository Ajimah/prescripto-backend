import express from 'express';
import {  registerUsers, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment } from '../controller/userController.js';
import authUser from '../middleware/authUser.js';
import upload  from '../middleware/multer.js';


const userRouter = express.Router();

userRouter.post('/register', registerUsers)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile',authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser,updateProfile)
userRouter.post ('/book-appointment',authUser, bookAppointment)
userRouter.get('/appointments',authUser, listAppointments)
userRouter.post('/cancel-appointment',authUser, cancelAppointment)




export default userRouter;