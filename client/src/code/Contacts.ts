/**
 * Contains a Worker class for dealing with contacts,
 * this is what talks to the server side of MailBag for contacts
 * Handles Axios REST calls for the Contacts API, including the new PUT feature
 */
import axios, { AxiosResponse } from "axios";
import { config } from "./config";

export interface IContact { _id?: string, name: string, email: string }

export class Worker {
    // Triggers the GET /contacts endpoint on the Express server
    public async listContacts(): Promise<IContact[]> {
        const response: AxiosResponse = await axios.get(`${config.serverAddress}/contacts`);
        return response.data;
    }
    // Triggers the POST /contacts endpoint on the Express server with a JSON body
    public async addContact(inContact: IContact): Promise<IContact> {
        const response: AxiosResponse = await axios.post(`${config.serverAddress}/contacts`, inContact);
        return response.data;
    }
    // Triggers the DELETE /contacts/:id endpoint on the Express server
    public async deleteContact(inID: string): Promise<void> {
        await axios.delete(`${config.serverAddress}/contacts/${inID}`);
    }
    // NEW FEATURE: Triggers the PUT /contacts/:id endpoint on the Express server
    public async updateContact(inContact: IContact): Promise<IContact> {
        const response: AxiosResponse = await axios.put(`${config.serverAddress}/contacts/${inContact._id}`, inContact);
        return response.data;
    }
}