import express = require('express');
import {protectedRoute} from "../middleware/auth.middleware";
import {getUsersForSidebar} from "../middleware/chat.middleware";

const router = express.Router();

router.get('/users',protectedRoute,getUsersForSidebar);

export default router;