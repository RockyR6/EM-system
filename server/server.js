import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import multer from 'multer';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import profileRouter from './routes/profileRoute.js';
import leaveRouter from './routes/leaveRoutes.js';
import payslipRouter from './routes/payslipRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';


const app = express()

const PORT = process.env.PORT || 4000;

//Middlewares
app.use(cors())
app.use(express.json())
app.use(multer().none())


//Routes
app.get('/', (req, res)=> res.send('Server is runniung'))
app.use('/api/auth', authRouter)
app.use('/api/employees', employeeRouter)
app.use('/api/profile', profileRouter)
app.use('/api/attendance', profileRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/payslip', payslipRouter)
app.use('/api/dashboard', dashboardRouter)


await connectDB()


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))