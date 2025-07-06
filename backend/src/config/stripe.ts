import Stripe from "stripe";
import { ENVVARS } from "../utils/envVars";

export const stripe = new Stripe(ENVVARS.STRIPE_SECRET_KEY);
