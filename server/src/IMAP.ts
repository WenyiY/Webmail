/**
 * Code that talks to an IMAP server to list mailboxes and messages and to retrieve messages
 * The module defines interfaces for IMessage and IMailbox and 
 * disables Node's default TLS certificate validation to simplify the development process .
 */
const ImapClient = require("emailjs-imap-client");
import { ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { IServerInfo } from "./ServerInfo";

export interface ICallOptions {
    mailbox: string,
    id?: number
}

export interface IMessage {
    id: string, 
    date: string,
    from: string,
    subject: string, 
    body?: string
}

export interface IMailbox { 
    name: string, 
    path: string 
}

// Disables Node's default TLS certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export class Worker {
    private static serverInfo: IServerInfo;

    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    }

    // Avoid redundancy: all the other methods will make use of this when connecting to the IMAP server
    private async connectToServer(): Promise<any> {
        const client: any = new ImapClient.default(
            Worker.serverInfo.imap.host,
            Worker.serverInfo.imap.port,
            { auth: Worker.serverInfo.imap.auth }
        );
        client.logLevel = client.LOG_LEVEL_NONE;
        client.onerror = (inError: Error) => {
            console.log(
                "IMAP.Worker.listMailboxes(): Connection error",
                inError
            );
        };
        await client.connect();
        return client;
    }

    // Retrieves the hierarchical list of mailboxes from the IMAP server and 
    // uses a recursive function to flatten it into a one-dimensional array for the client
    public async listMailboxes(): Promise<IMailbox[]> {
        const client: any = await this.connectToServer();
        const mailboxes: any = await client.listMailboxes();
        await client.close();
        const finalMailboxes: IMailbox[] = [];
        const iterateChildren: Function =
            (inArray: any[]): void => {
                inArray.forEach((inValue: any) => {
                    finalMailboxes.push({
                        name: inValue.name, path: inValue.path
                    });
                    iterateChildren(inValue.children);
                });
            };
        iterateChildren(mailboxes.children);
        return finalMailboxes;
    }

    // Selects a specific mailbox and queries it for an array of messages, 
    // requesting only the metadata (envelope) and unique ID to save bandwidth
    public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
        const client: any = await this.connectToServer();
        try {
            const mailbox: any = await client.selectMailbox(inCallOptions.mailbox);
            if (mailbox.exists === 0) {
                await client.close();
                return [];
            }
            const messages: any[] = await client.listMessages(
                inCallOptions.mailbox, "1:*", ["uid", "envelope"]
            );
            await client.close();
            const finalMessages: IMessage[] = [];
            messages.forEach((inValue: any) => {
                finalMessages.push({
                    id: inValue.uid, date: inValue.envelope.date,
                    from: inValue.envelope.from[0].address,
                    subject: inValue.envelope.subject
                });
            });
            
            return finalMessages;
        }
        catch (inError) {
            // If the mailbox doesn't exist or isn't selectable, return an empty array 
            // instead of letting the error bubble up to a 500 response.
            console.warn(`Mailbox not selectable: ${inCallOptions.mailbox}`);
            await client.close();
            return [];
        }
    }

    // Queries the server for a specific message by its UID, 
    // passes the result through mailparser's simpleParser, and 
    // returns the extracted plain text body
    public async getMessageBody(inCallOptions: ICallOptions): Promise<string | undefined> {
        const client: any = await this.connectToServer();
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox, inCallOptions.id,
            ["body[]"], { byUid: true }
        );
        const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]);
        await client.close();
        return parsed.text;
    }

    // Connects to the server and deletes a specific message using its UID
    public async deleteMessage(inCallOptions: ICallOptions): Promise<any> {
        const client: any = await this.connectToServer();
        await client.deleteMessages(
            inCallOptions.mailbox, inCallOptions.id, { byUid: true }
        );
        await client.close();
    }
}