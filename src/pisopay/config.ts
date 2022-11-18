import * as dotenv from 'dotenv';

dotenv.config();

export const USER = process.env.PISOPAY_USER;
export const PASSWORD = process.env.PISOPAY_PASSWORD;
export const XGATEWAY = process.env.PISOPAY_XGATEWAYAUTH;