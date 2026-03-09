"use strict";
/**
 * This class initializes the Express app,
 * applies middleware to parse incoming JSON bodies,
 * and uses static middleware to serve the client's built web files.
 * It also implements custom middleware to bypass CORS (Cross-Origin Resource Sharing) restrictions
 * so the API can be called during development
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const ServerInfo_1 = require("./ServerInfo");
const IMAP = __importStar(require("./IMAP"));
const SMTP = __importStar(require("./SMTP"));
const Contacts = __importStar(require("./contacts"));
const app = (0, express_1.default)();
// Middleware to parse incoming JSON bodies
app.use(express_1.default.json());
// Middleware to serve static client files
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
// Custom CORS Middleware
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    // FEATURE ADDITION: Added 'PUT' to the allowed methods for the new update endpoint
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});
// REST Endpoint: List Mailboxes
// A GET endpoint at /mailboxes calls the IMAP worker to 
// retrieve an array of mailboxes and returns it as JSON
app.get("/mailboxes", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const mailboxes = yield imapWorker.listMailboxes();
        inResponse.status(200).json(mailboxes);
    }
    catch (inError) {
        console.log("IMAP Error:", inError);
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: List Messages
// A GET endpoint at /mailboxes/:mailbox captures the mailbox name from the URL path and 
// returns a list of messages within it
app.get("/mailboxes/:mailbox", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const messages = yield imapWorker.listMessages({
            mailbox: inRequest.params.mailbox
        });
        inResponse.status(200).json(messages);
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: Get a Message
// A GET endpoint at /messages/:mailbox/:id captures both the mailbox name and message ID to 
// return the specific plain text body of an email
app.get("/messages/:mailbox/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        const messageBody = yield imapWorker.getMessageBody({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        if (messageBody) {
            inResponse.status(200).send(messageBody);
        }
        else {
            inResponse.status(404).send("Message not found");
        }
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: Delete a Message
// A DELETE endpoint at /messages/:mailbox/:id deletes a specific message from the server
app.delete("/messages/:mailbox/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imapWorker = new IMAP.Worker(ServerInfo_1.serverInfo);
        yield imapWorker.deleteMessage({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        });
        inResponse.status(204).send(); // 204 No Content is standard for successful DELETE
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: Send a Message
// A POST endpoint at /messages receives message details in the request body and 
// uses the SMTP worker to send the email.
app.post("/messages", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const smtpWorker = new SMTP.Worker(ServerInfo_1.serverInfo);
        yield smtpWorker.sendMessage(inRequest.body);
        inResponse.status(201).send("ok"); // 201 Created
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: List Contacts
// Standard CRUD endpoints are created at /contacts utilizing GET to list
app.get("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        const contacts = yield contactsWorker.listContacts();
        inResponse.status(200).json(contacts);
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: Add Contact
// POST to return the new contact with its generated ID
app.post("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("POST /contacts: ", inRequest.body); // Check what data arrived
        const contactsWorker = new Contacts.Worker();
        const contact = yield contactsWorker.addContact(inRequest.body);
        inResponse.status(201).json(contact); // 201 Created
    }
    catch (inError) {
        console.log("Error in POST /contacts:", inError);
        inResponse.status(500).send("error");
    }
}));
// NEW EXCLUSIVE FEATURE: Update Contact
// PUT to update the contact by its ID
app.put("/contacts/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        const numUpdated = yield contactsWorker.updateContact(inRequest.params.id, inRequest.body);
        if (numUpdated === 0) {
            inResponse.status(404).send("Contact not found");
        }
        else {
            inResponse.status(200).send("ok");
        }
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// REST Endpoint: Delete Contact
// DELETE to remove a contact by its ID
app.delete("/contacts/:id", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Contacts.Worker();
        yield contactsWorker.deleteContact(inRequest.params.id);
        inResponse.status(204).send(); // 204 No Content
    }
    catch (inError) {
        inResponse.status(500).send("error");
    }
}));
// Start the server
app.listen(8080, () => {
    console.log("MailBag server running on port 8080");
});
//# sourceMappingURL=main.js.map