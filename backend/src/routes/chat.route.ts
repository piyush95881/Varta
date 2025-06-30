import express = require('express');
import {protectedRoute} from "../middleware/auth.middleware";
import {getUsersForSidebar,getChatMessages,sendMessages} from "../controllers/chat.controller";

const router = express.Router();

router.get('/users',protectedRoute,getUsersForSidebar);
router.get('/:id',protectedRoute,getChatMessages);
router.post('/send/:id',protectedRoute,sendMessages);

export default router;