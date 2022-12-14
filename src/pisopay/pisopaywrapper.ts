import { AxiosStatic } from 'axios';
import { PASSWORD, USER, XGATEWAY } from './config';

interface Payload {
    [key: string]: any;
}

const axios = require("axios") as AxiosStatic;
const controller = new AbortController();

export class PisopayWrapper {
    
    // creds
    protected user: string;
    protected password: string;
    protected xgateway: string;

    public sessionId: string;

    constructor() {
        this.user = USER
        this.password = PASSWORD
        this.xgateway = XGATEWAY
    }

    async generateSession() {
        const config = {
            method: 'get',
            url: 'https://api.pisopay.com.ph/checkout/1.0/login',
            headers: {
                'X-Gateway-Auth': this.xgateway,
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(this.user + ':' + this.password).toString('base64')}`
            },
            signal: controller.signal
        }

        try {

            const response = await axios(config)

            if (response.data.responseCode === "0") {

                this.sessionId = response.data.data.sessionId
                return response;

            } else {
                console.log(response)
                controller.abort()
            }
            
        } catch (error) {

            console.log(error)
            controller.abort()

        }
    }

    async checkout(data: Payload) {
        await this.generateSession();

        let payload:Payload = {}

        payload["customerName"] = data["customerName"];
        payload["customerEmail"] = data["customerEmail"];
        payload["customerPhone"] = data["customerPhone"];
        payload["amount"] = data["amount"];
        payload["traceNo"] = data["traceNo"];
        payload["details"] = data["details"];
        payload["merchantCallbackURL"] = data["merchantCallbackURL"];
        payload["callbackUrl"] = data["callbackUrl"];

        const config = {
            method: 'post',
            url: 'https://api.pisopay.com.ph/checkout/1.0/payment/commit',
            headers: {
                'X-Gateway-Auth': this.xgateway,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.sessionId}`
            },
            data: payload,
            signal: controller.signal
        }

        try {

            const response = await axios(config)

            if (response.data.responseCode === "0") {
                return response
            } else {
                console.log(response)
                controller.abort()
            }

        } catch (error) {
            
            console.log(error)
            controller.abort()
        }
        
    }

    async traceTransac(traceNo: string) {
        await this.generateSession();

        if (!traceNo || traceNo === "") {
            console.log("Trace number is required!")
            controller.abort()
        }

        const config = {
            method: 'post',
            url: 'https://api.pisopay.com.ph/checkout/1.0/payment/inquiry',
            headers: {
                'X-Gateway-Auth': this.xgateway,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.sessionId}`
            },
            data: traceNo,
            signal: controller.signal
        }

        try {

            const response = await axios(config)

            if (response.data.responseCode === "0") {
                return response
            }

        } catch (error) {
            
            console.log(error)
            controller.abort()

        }

    }
}