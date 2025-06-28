import {v2 as cloudinary} from "cloudinary";

import {config} from 'dotenv'

config()

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUDINARY_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,

})

export default cloudinary;