/**
 * This class initializes the Express app, 
 * applies middleware to parse incoming JSON bodies, 
 * and uses static middleware to serve the client's built web files. 
 * It also implements custom middleware to bypass CORS (Cross-Origin Resource Sharing) restrictions 
 * so the API can be called during development
 */

import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./contacts";
import { IContact } from "./contacts";

const app: Express = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Middleware to serve static client files
app.use("/", express.static(path.join(__dirname, "../../client/dist")));

// Custom CORS Middleware
app.use(function (inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    // FEATURE ADDITION: Added 'PUT' to the allowed methods for the new update endpoint
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});

// REST Endpoint: List Mailboxes
// A GET endpoint at /mailboxes calls the IMAP worker to 
// retrieve an array of mailboxes and returns it as JSON
app.get("/mailboxes", async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
        inResponse.status(200).json(mailboxes);
    } catch (inError) {
        console.log("IMAP Error:", inError);
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: List Messages
// A GET endpoint at /mailboxes/:mailbox captures the mailbox name from the URL path and 
// returns a list of messages within it
app.get("/mailboxes/:mailbox", async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messages: IMAP.IMessage[] = await imapWorker.listMessages({
            mailbox: inRequest.params.mailbox
        });
        inResponse.status(200).json(messages);
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: Get a Message
// A GET endpoint at /messages/:mailbox/:id captures both the mailbox name and message ID to 
// return the specific plain text body of an email
app.get("/messages/:mailbox/:id", async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messageBody: string | undefined = await imapWorker.getMessageBody({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        if (messageBody) {
            inResponse.status(200).send(messageBody);
        } else {
            inResponse.status(404).send("Message not found");
        }
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: Delete a Message
// A DELETE endpoint at /messages/:mailbox/:id deletes a specific message from the server
app.delete("/messages/:mailbox/:id", async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        await imapWorker.deleteMessage({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        inResponse.status(204).send(); // 204 No Content is standard for successful DELETE
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: Send a Message
// A POST endpoint at /messages receives message details in the request body and 
// uses the SMTP worker to send the email.
app.post("/messages", async (inRequest: Request, inResponse: Response) => {
    try {
        const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
        await smtpWorker.sendMessage(inRequest.body);
        inResponse.status(201).send("ok"); // 201 Created
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: List Contacts
// Standard CRUD endpoints are created at /contacts utilizing GET to list
app.get("/contacts", async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contacts: IContact[] = await contactsWorker.listContacts();
        inResponse.status(200).json(contacts);
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: Add Contact
// POST to return the new contact with its generated ID
app.post("/contacts", async (inRequest: Request, inResponse: Response) => {
    try {
        console.log("POST /contacts: ", inRequest.body); // Check what data arrived
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contact: IContact = await contactsWorker.addContact(inRequest.body);
        inResponse.status(201).json(contact); // 201 Created
    } catch (inError) {
        console.log("Error in POST /contacts:", inError);
        inResponse.status(500).send("error");
    }
});

// NEW EXCLUSIVE FEATURE: Update Contact
// PUT to update the contact by its ID
app.put("/contacts/:id", async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const numUpdated = await contactsWorker.updateContact(inRequest.params.id, inRequest.body);
        if (numUpdated === 0) {
            inResponse.status(404).send("Contact not found");
        } else {
            inResponse.status(200).send("ok");
        }
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// REST Endpoint: Delete Contact
// DELETE to remove a contact by its ID
app.delete("/contacts/:id", async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        await contactsWorker.deleteContact(inRequest.params.id);
        inResponse.status(204).send(); // 204 No Content
    } catch (inError) {
        inResponse.status(500).send("error");
    }
});

// Start the server
app.listen(8080, () => {
    console.log("MailBag server running on port 8080");
});