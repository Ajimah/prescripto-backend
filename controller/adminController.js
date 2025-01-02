import validator from "validator"
import bcrypt from "bcrypt"
import {v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'


// Api for adding doctors 
const addDoctor = async (req,res) => {
    try {
        const {name, email, password, speciality, degree,expirence, about, fees, address } = req.body
        const imageFile = req.file
        
        //checking for all data to add doctor

        if(!name || !email || !password || !speciality || !degree || !about || !fees || !address || !expirence ){
            return res.json({success: false, message:'missing details'})
        };
 

        //validating email format 

        if(!validator.isEmail(email)){
            return res.json({success: false, message:'please enter a valid email'})
        }

        //validating password 
        if(password.length < 8){
            return res.json({success: false, message:'please enter a stronge password'})
        };


        //hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //upload image to cloudinary server
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
       
        const imageURL = imageUpload.secure_url


        const doctorData = {
            name,
            email,
            image:imageURL,
            password:hashedPassword,
            speciality,
            degree,
            expirence,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now(),
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true, message: 'Doctor saved'});

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}



// API for admin login

const LoginAdmin = async (req, res) => {

    try {
        
        const {email, password} = req.body;
           
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success: true, token})
        }else{
            res.json({success:false, message:"incorrect email and password"})
        }


    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}


//API TO GET ALL DOCTORS  LIST FOR ADMIN PANEL


const allDoctors = async (req, res) => {
    try {
        
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true, message:doctors})
        

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}



export {addDoctor,LoginAdmin, allDoctors}