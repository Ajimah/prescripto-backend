import validator from 'validator'
import  bcrypt  from 'bcrypt';
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import {v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'


//API TO REGISTER USER

const registerUsers = async (req, res) => {
    try {
        const {name,email,password} = req.body
        if (!name || !email || !password) {
            return res.status(400).json({sucess: false, message: 'All fields are required'})
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({sucess: false, message: 'Invalid email'})
        }
        if(password.length < 8) {
            return res.status(400).json({sucess: false, message: 'Password must be at least 8 characters'})

        }

        //hashing user password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        //save user data to database

        const newUser = new userModel(userData)
        const user = await newUser.save()

        //generate token

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

        res.json({success: true, token})

    } catch (error) {
        console.error(error)
        res.status(500).json({success:false, message:error.message})
    }
}




    //api for user login

    const loginUser = async (req, res) => {
        try {

            const {email, password} = req.body
            const user = await userModel.findOne({email})


            if (!user) {
            return res.status(500).json({success:false, message:'User not found'})
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (isMatch) {
                const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
                res.json({success:true, token})
            }else{
                res.status(500).json({success:false, message:'Invalid credentials'})
            }


        } catch (error) {
            console.error(error)
        res.status(500).json({success:false, message:error.message})
        }
    }


    //api for getting user information

    const getProfile = async (req, res) => {

        try {
            const {userId} = req.body
            const userData = await userModel.findById(userId).select('-password')
            res.json({success:true, userData})


        } catch (error) {
            console.error(error)
        res.status(500).json({success:false, message:error.message})
        }
    }




    //api to update profile


    const updateProfile = async (req, res) => {
        try {
            const  {userId, name, phone, address, dob, gender} = req.body
            const imageFile = req.file

            if(!name || !phone  || !dob || !gender){
                return res.status(404).json({success:false, message:"data missing"})
            }

            let parsedAddress;
            try {
                parsedAddress = JSON.parse(address);
            } catch (error) {
                return res.status(400).json({success: false, message: 'Invalid address format'});
            }


            await userModel.findByIdAndUpdate(userId, {name, phone, address: parsedAddress, dob, gender})


            if(imageFile){
                //upload image to cloudnary
                const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type: 'image'})
                const imageURL = imageUpload.secure_url
                await userModel.findByIdAndUpdate(userId, {image:imageURL})
            }
            res.json({success: true, message:'profile updated successfully'})


        } catch (error) {
            console.error(error)
        res.status(500).json({success:false, message:error.message})
        }
    }


    //API TO BOOK APPOINTMENT

    const bookAppointment = async (req, res) => {
        try {
           
            const {userId, docId, slotDate, slotTime } = req.body
            // First, check if all required fields are provided
            if (!userId || !docId || !slotDate || !slotTime) {
                return res.status(400).json({ success: false, message: 'All fields (userId, docId, slotDate, slotTime) are required.' });
            }
            const docData = await doctorModel.findById(docId).select('-password')
            if(!docData.available) {
                return res.status(404).json({success:false, message:'Doctor not available'})
            }
           

            console.log(docData)


            let slots_booked = docData.slots_booked

            
        //checking for slots availability
        if (slots_booked[slotDate]){
          
            if (slots_booked[slotDate].includes(slotTime)){
                return res.status(404).json({success:false, message:'Slot not available'})
            }else {
                slots_booked[slotDate].push(slotTime)
               

            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)

        }
       
        const userData = await userModel.findById(userId).select('-password')

        // delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            slotDate,
            slotTime,
            userData,
            docData,
            amount: docData.fees, 
            date: Date.now(),
          };
     
        
          const newAppointment = new appointmentModel(appointmentData)
          await newAppointment.save()
      
          
        //save new slot data in docData

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success:true, message:'Appointment booked successfully'})

        } catch (error) {
            console.error(error)
        res.status(500).json({success:false, message:error.message})
        }
        
    }

    
    //api to get user appointments for frontend mt appointment page
    
    const listAppointments = async (req,res) => {
        try {
            const {userId} = req.body
            const appointments = await appointmentModel.find({userId})
            res.json({success: true, appointments})
        } catch (error) {
            console.error(error)
            res.status(500).json({success:false, message:error.message})
        }
    }


    //api to cancel appointment


    const cancelAppointment = async (req,res) => {
        try {
            
            const {userId, appointmentId} = req.body
            const appointmentData = await appointmentModel.findById(appointmentId)

            //verify appointment user 

            if(appointmentData.userId.toString() !== userId){
                return res.status(401).json({success:false, message:'Unauthorized'})
            }

            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})



            //releasing doctor slots

            const {docId, slotDate, slotTime} = appointmentData

            const doctorData = await doctorModel.findById(docId)


            let slots_booked = doctorData.slots_booked

            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

            await doctorModel.findByIdAndUpdate(docId, {slots_booked})
            res.json({success:true, message:'Appointment cancelled successfully'})


        } catch (error) {
            console.error(error)
            res.status(500).json({success:false, message:error.message})
        }
    }


    const razorpayInstance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET})



    //api making online payment for appointmnt using razorpay

    const paymentRazorpay = async (req, res) => {
        
    }







export {registerUsers,loginUser,getProfile,updateProfile,bookAppointment,listAppointments,cancelAppointment};