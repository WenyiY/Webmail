/**
 * Most of the action of the app actually is
 * Contains application data and mutator functions to trigger React re-renders. 
 * It includes the new updateContact logic
 */
import React from "react";
import * as Contacts from "./Contacts";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import { config } from "./config";

// Singleton pattern to make sure only ever ONE state object in memory.
let stateSingleton: any = null;

// Helper function so non-React files can grab the current state if needed.
export function getState(): any {
    return stateSingleton;
}

// Initializes the state and binds its functions to the BaseLayout component.
export function createState(inParentComponent: React.Component): any {
    if (stateSingleton === null) {
        stateSingleton = {
            // --- DATA VARIABLES ---
            pleaseWaitVisible: false, // Controls the loading spinner
            contacts: [],             // Array holding contact objects
            mailboxes: [],            // Array holding mailbox folder names
            messages: [],             // Array holding emails for the selected mailbox
            currentView: "welcome",   // Controls which central view is rendering (welcome, message, compose, contact, contactAdd)
            currentMailbox: null,     // Tracks which mailbox is clicked

            // Temporary variables for reading/composing emails
            messageID: null,
            messageDate: null,
            messageFrom: null,
            messageTo: null,
            messageSubject: null,
            messageBody: null,

            // Temporary variables for viewing/editing contacts
            contactID: null,
            contactName: "",
            contactEmail: "",

            // --- MUTATOR FUNCTIONS ---
            // `this: any` parameter prevents the TS error
            // The `.bind(inParentComponent)` at the end forces `this` to refer to BaseLayout,
            // allowing `this.setState()` to trigger a React UI refresh.

            // Toggles the loading spinner dialog
            showHidePleaseWait: function (this: any, inVisible: boolean): void {
                this.setState(() => ({ pleaseWaitVisible: inVisible }));
            }.bind(inParentComponent),

            // Appends a single mailbox to the list
            addMailboxToList: function (this: any, inMailbox: IMAP.IMailbox): void {
                this.setState((prevState: any) => ({ mailboxes: [...prevState.mailboxes, inMailbox] }));
            }.bind(inParentComponent),

            // Appends a single contact to the list
            addContactToList: function (this: any, inContact: Contacts.IContact): void {
                this.setState((prevState: any) => ({ contacts: [...prevState.contacts, inContact] }));
            }.bind(inParentComponent),

            // Clears the message form and switches the UI to the compose view.
            showComposeMessage: function (this: any, inType: string): void {
                switch (inType) {
                    case "new":
                        this.setState(() => ({
                            currentView: "compose", messageTo: "", messageSubject: "", messageBody: "", messageFrom: config.userEmail
                        }));
                        break;
                    case "reply": // Pre-fills the 'To' and 'Subject' fields for a reply
                        this.setState(() => ({
                            currentView: "compose", messageTo: this.state.messageFrom, messageSubject: `Re: ${this.state.messageSubject}`
                        }));
                        break;
                    case "contact": // Pre-fills the 'To' field when clicking "Send Email" on a contact
                        this.setState(() => ({
                            currentView: "compose", messageTo: this.state.contactEmail, messageSubject: "", messageBody: "", messageFrom: config.userEmail
                        }));
                        break;
                }
            }.bind(inParentComponent),

            // Clears the contact form and switches the UI to the add contact view
            showAddContact: function (this: any): void {
                this.setState(() => ({ currentView: "contactAdd", contactID: null, contactName: "", contactEmail: "" }));
            }.bind(inParentComponent),

            // Triggers when a user clicks a mailbox. Updates the state and asks the IMAP worker for messages.
            setCurrentMailbox: function (this: any, inPath: string): void {
                this.setState(() => ({ currentView: "welcome", currentMailbox: inPath }));
                this.state.getMessages(inPath);
            }.bind(inParentComponent),

            // Asks the IMAP worker to fetch messages for a specific mailbox from the backend
            getMessages: async function (this: any, inPath: string): Promise<void> {
                this.state.showHidePleaseWait(true);
                try {
                const imapWorker: IMAP.Worker = new IMAP.Worker();
                const messages: IMAP.IMessage[] = await imapWorker.listMessages(inPath);
                this.state.showHidePleaseWait(false);
                this.state.clearMessages();
                messages.forEach((inMessage: IMAP.IMessage) => {
                    this.state.addMessageToList(inMessage);
                });
                } catch (inError) {
                    console.error("Error fetching messages:", inError);
                    alert("Could not retrieve messages for this folder.");
                } finally {
                    // This ensures the loading spinner always disappears, 
                    // even if the request fails.
                    this.state.showHidePleaseWait(false);
                }
            }.bind(inParentComponent),

            clearMessages: function (this: any): void {
                this.setState(() => ({ messages: [] }));
            }.bind(inParentComponent),

            addMessageToList: function (this: any, inMessage: IMAP.IMessage): void {
                this.setState((prevState: any) => ({ messages: [...prevState.messages, inMessage] }));
            }.bind(inParentComponent),

            // Switches UI to view a specific contact
            showContact: function (this: any, inID: string, inName: string, inEmail: string): void {
                this.setState(() => ({ currentView: "contact", contactID: inID, contactName: inName, contactEmail: inEmail }));
            }.bind(inParentComponent),

            // Generic handler attached to TextFields. It saves the characters to the matching state variable.
            fieldChangeHandler: function (this: any, inEvent: any): void {
                if (inEvent.target.id === "contactName" && inEvent.target.value.length > 16) { return; }
                this.setState({ [inEvent.target.id]: inEvent.target.value });
            }.bind(inParentComponent),

            // Asks the Contacts worker to POST a new contact to the backend, then updates the local list.
            saveContact: async function (this: any): Promise<void> {
                const cl = this.state.contacts.slice(0);
                this.state.showHidePleaseWait(true);
                const contactsWorker: Contacts.Worker = new Contacts.Worker();
                const contact: Contacts.IContact = await contactsWorker.addContact({ name: this.state.contactName, email: this.state.contactEmail });
                this.state.showHidePleaseWait(false);
                cl.push(contact); // Append the returned contact (with backend _id) to the list
                this.setState(() => ({ contacts: cl, contactID: null, contactName: "", contactEmail: "" }));
            }.bind(inParentComponent),

            // Asks the Contacts worker to DELETE a contact from the backend, then removes it from the local list.
            deleteContact: async function (this: any): Promise<void> {
                this.state.showHidePleaseWait(true);
                const contactsWorker: Contacts.Worker = new Contacts.Worker();
                await contactsWorker.deleteContact(this.state.contactID);
                this.state.showHidePleaseWait(false);
                const cl = this.state.contacts.filter((inElement: any) => inElement._id !== this.state.contactID);
                this.setState(() => ({ contacts: cl, contactID: null, contactName: "", contactEmail: "", currentView: "welcome" }));
            }.bind(inParentComponent),

            // NEW UX FEATURE: Asks the Contacts worker to PUT (update) an existing contact on the backend.
            updateContact: async function (this: any): Promise<void> {
                try {
                    this.state.showHidePleaseWait(true);
                    const contactsWorker: Contacts.Worker = new Contacts.Worker();

                    // Call the server to update the database
                    const updatedContact: Contacts.IContact = await contactsWorker.updateContact({
                        _id: this.state.contactID,
                        name: this.state.contactName,
                        email: this.state.contactEmail
                    });

                    this.state.showHidePleaseWait(false);

                    // Create a new array for the list to trigger React re-render
                    // Look for the contact with the matching ID and replace it
                    const updatedList = this.state.contacts.map((c: Contacts.IContact) =>
                        c._id === updatedContact._id ? updatedContact : c
                    );

                    // Update the state and provide feedback
                    this.setState(() => ({
                        contacts: updatedList,
                        contactID: null,
                        contactName: "",
                        contactEmail: "",
                        currentView: "welcome"
                    }), () => {
                        // Callback runs after the state is successfully set
                        alert("Contact updated successfully!");
                    });

                } catch (error) {
                    this.state.showHidePleaseWait(false);
                    alert("Failed to update contact. Check server logs.");
                }
            }.bind(inParentComponent),

            // Asks the IMAP worker to fetch the email body text from the backend when a message is clicked.
            showMessage: async function (this: any, inMessage: IMAP.IMessage): Promise<void> {
                this.state.showHidePleaseWait(true);
                const imapWorker: IMAP.Worker = new IMAP.Worker();
                const mb: string = await imapWorker.getMessageBody(inMessage.id, this.state.currentMailbox);
                this.state.showHidePleaseWait(false);
                this.setState(() => ({
                    currentView: "message", messageID: inMessage.id, messageDate: inMessage.date, messageFrom: inMessage.from,
                    messageTo: "", messageSubject: inMessage.subject, messageBody: mb
                }));
            }.bind(inParentComponent),

            // Asks the SMTP worker to POST a new email payload to the backend to be sent.
            sendMessage: async function (this: any): Promise<void> {
                this.state.showHidePleaseWait(true);
                const smtpWorker: SMTP.Worker = new SMTP.Worker();
                await smtpWorker.sendMessage(this.state.messageTo, this.state.messageFrom, this.state.messageSubject, this.state.messageBody);
                this.state.showHidePleaseWait(false);
                this.setState(() => ({ currentView: "welcome" }));
            }.bind(inParentComponent),

            // Asks the IMAP worker to DELETE an email from the backend, then removes it from the local list.
            deleteMessage: async function (this: any): Promise<void> {
                this.state.showHidePleaseWait(true);
                const imapWorker: IMAP.Worker = new IMAP.Worker();
                await imapWorker.deleteMessage(this.state.messageID, this.state.currentMailbox);
                this.state.showHidePleaseWait(false);
                const cl = this.state.messages.filter((inElement: any) => inElement.id !== this.state.messageID);
                this.setState(() => ({ messages: cl, currentView: "welcome" }));
            }.bind(inParentComponent)
        };
    }
    return stateSingleton;
}