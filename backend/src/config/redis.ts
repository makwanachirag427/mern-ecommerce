import Redis from "ioredis";
import { ENVVARS } from "../utils/envVars";

export const redis = new Redis(ENVVARS.UPSTASH_REDIS_URL);


