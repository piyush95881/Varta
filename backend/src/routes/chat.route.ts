import express from "express";
import {protectedRoute} from "../middleware/auth.middleware.ts";
import {getUsersForSidebar,getChatMessages,sendMessages} from "../controllers/chat.controller.ts";

const router = express.Router();

router.get('/users',protectedRoute,getUsersForSidebar);
router.get('/:id',protectedRoute,getChatMessages);
router.post('/send/:id',protectedRoute,sendMessages);

export default router;