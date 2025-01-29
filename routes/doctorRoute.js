import express  from 'express';
import { doctorList , loginDoctor, appointmentDoctor} from '../controller/doctorController.js';
import authDoctor from './../middleware/authDoctor.js';


const doctorRouter = express.Router();


doctorRouter.get('/list', doctorList);
doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/appointments',authDoctor,appointmentDoctor);



export default doctorRouter;