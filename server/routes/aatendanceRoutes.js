import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { clockInOut, getAttendance } from '../controllers/attendanceController.js'


const attendaceRouter = Router()


attendaceRouter.put('/', protect, clockInOut)
attendaceRouter.get('/', protect, getAttendance)

export default attendaceRouter;