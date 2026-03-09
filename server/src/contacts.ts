/**
 * Code dealing with contacts (listing, adding, updating and deleting them). 
 * This manages interactions with the NeDB NoSQL database. 
 * Added the custom updateContact method here to handle the HTTP PUT feature that added to main.ts
 */
import * as path from "path";
import Datastore from "nedb";

export interface IContact {
    _id?: string, // Using string since NeDB auto-generates alphanumeric keys
    name: string,
    email: string
}

export class Worker {
    private db: Datastore;

    constructor() {
        this.db = new Datastore({
            filename: path.join(__dirname, "contacts.db"),
            autoload: true
        });
    }

    // Wraps NeDB's find() method in a Promise to return all stored contact documents
    public listContacts(): Promise<IContact[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({},
                (inError: Error, inDocs: IContact[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    }

    // Wraps NeDB's insert() method in a Promise to save a new contact, 
    // returning the newly saved object with its auto-generated _id
    public addContact(inContact: IContact): Promise<IContact> {
        return new Promise((inResolve, inReject) => {
            this.db.insert(inContact,
                (inError: Error | null, inNewDoc: IContact) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inNewDoc);
                    }
                }
            );
        });
    }

    // Wraps NeDB's remove() method in a Promise to delete a specific contact document by matching its _id
    public deleteContact(inID: string): Promise<string> {
        return new Promise((inResolve, inReject) => {
            this.db.remove({ _id: inID }, {},
                (inError: Error | null, inNumRemoved: number) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve("");
                    }
                }
            );
        });
    }

    // EXCLUSIVE FEATURE ADDITION: Updating an existing contact by its ID
    public updateContact(inID: string, inContact: IContact): Promise<number> {
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: inID }, inContact, {},
                (inError: Error | null, numReplaced: number) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(numReplaced); // Returns the number of documents modified
                    }
                }
            );
        });
    }
}