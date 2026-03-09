/**
 * Like Contacts.ts, this contains a Worker for performing all the IMAP functions, 
 * in conjunction with the server
 * Handles Axios REST calls for retrieving mailboxes and messages
 */

import axios, { AxiosResponse } from "axios";
import { config } from "./config";

export interface IMailbox { name: string, path: string }
export interface IMessage { id: string, date: string, from: string, subject: string, body?: string }

export class Worker {
    // Triggers GET /mailboxes to fetch folder names (Inbox, Sent, etc.)
    public async listMailboxes(): Promise<IMailbox[]> {
        const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes`);
        return response.data;
    }
    // Triggers GET /mailboxes/:mailbox to fetch message headers (Sender, Subject, Date)
    public async listMessages(inMailbox: string): Promise<IMessage[]> {
        const response = await axios.get(
            `${config.serverAddress}/mailboxes/${encodeURIComponent(inMailbox)}`
        );
        return response.data;
    }
    // Triggers GET /messages/:mailbox/:id to fetch the heavy email body text
    public async getMessageBody(inID: string, inMailbox: string): Promise<string> {
        // encodeURIComponent handles the [Gmail]/Sent Mail part
        const response = await axios.get(
            `${config.serverAddress}/messages/${encodeURIComponent(inMailbox)}/${inID}`
        );
        return response.data;
    }
    // Triggers DELETE /messages/:mailbox/:id to delete an email from the server
    public async deleteMessage(inID: string, inMailbox: string): Promise<void> {
        await axios.delete(`${config.serverAddress}/messages/${inMailbox}/${inID}`);
    }
}