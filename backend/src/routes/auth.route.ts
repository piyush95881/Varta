import express from "express"
import {signup,login,logout,updateProfile,checkAuth} from '../controllers/auth.controller.ts'
import {protectedRoute} from '../middleware/auth.middleware.ts'


const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.put('/update-profile',protectedRoute,updateProfile)
router.get('/check',protectedRoute,checkAuth)

export default router;