import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { getDashboard } from '../controllers/dashboardController.js'


const dashboardRouter = Router()

dashboardRouter.post('/', protect, getDashboard)


export default dashboardRouter;