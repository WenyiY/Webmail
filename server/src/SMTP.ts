/**
 * Code that talks to an SMTP server to send messages. 
 * This file contains the Worker class responsible for sending emails using the nodemailer library.
 *  The callback-based API is wrapped in a Promise so main.ts can use async/await
 */
import Mail from "nodemailer/lib/mailer";
import * as nodemailer from "nodemailer";
import { SendMailOptions, SentMessageInfo } from "nodemailer";
import { IServerInfo } from "./ServerInfo";

export class Worker {
    private static serverInfo: IServerInfo;

    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    }

    // Take message options and wraps the callback-based Nodemailer API inside a Promise 
    // so that the rest of the application can utilize async/await syntax to send mail.
    public sendMessage(inOptions: SendMailOptions): Promise<string> {
        return new Promise((inResolve, inReject) => {
            const transport: Mail = nodemailer.createTransport(Worker.serverInfo.smtp);
            transport.sendMail(inOptions,
                (inError: Error | null, inInfo: SentMessageInfo) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve("");
                    }
                }
            );
        });
    }
}