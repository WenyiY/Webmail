/**
 * Just like IMAP.ts, but for the SMTP (send) functionality
 * Handles Axios REST calls for sending messages
 */
import axios from "axios";
import { config } from "./config";

export class Worker {
    // Triggers POST /messages to send an email payload to the Node server (via nodemailer)
    public async sendMessage(inTo: string, inFrom: string, inSubject: string, inMessage: string): Promise<void> {
        await axios.post(`${config.serverAddress}/messages`, {
            to: inTo, from: inFrom, subject: inSubject, text: inMessage
        });
    }
}