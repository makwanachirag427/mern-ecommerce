import { v2 as cloudinary } from "cloudinary";
import { ENVVARS } from "../utils/envVars";

cloudinary.config({
  cloud_name: ENVVARS.CLOUDINARY_CLOUD_NAME,
  api_key: ENVVARS.CLOUDINARY_API_KEY,
  api_secret: ENVVARS.CLOUDINARY_API_SECRET,
});

export default cloudinary;
