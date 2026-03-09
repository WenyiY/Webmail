/**
 * The main code entry point, where React will begin to build UI from.
 * It waits for the state object to initialize, 
 * fetches the initial mailboxes and contacts, and then mounts the BaseLayout to the DOM
 */
import "normalize.css";
import "../css/main.css";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import BaseLayout from "./components/BaseLayout";
import * as IMAP from "./IMAP";
import * as Contacts from "./Contacts";
import { getState } from "./state";

const baseComponent: Root = createRoot(document.getElementById("mainContainer")!);
baseComponent.render(<BaseLayout />);

const startupFunction = function (): void {
    getState().showHidePleaseWait(true);

    // Call the server and get a list of mailboxes available for the account and 
    // a list of contacts the user has created
    async function getMailboxes(): Promise<any> {
        const imapWorker: IMAP.Worker = new IMAP.Worker();
        const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
        mailboxes.forEach((inMailbox) => {
            getState().addMailboxToList(inMailbox);
        });
    }

    getMailboxes().then(function (): void {
        async function getContacts() {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: Contacts.IContact[] = await contactsWorker.listContacts();
            contacts.forEach((inContact) => {
                getState().addContactToList(inContact);
            });
        }
        // Cause React to hide the please wait popup
        getContacts().then(() => getState().showHidePleaseWait(false));
    });
};

// Create a timeout until we get a state object, until React renders the BaseLayout component
const intervalFunction = function (): void {
    if (getState() === null) {
        setTimeout(intervalFunction, 100);
    } else {
        startupFunction();
    }
};

intervalFunction();