/**
 * The main React structural component housing all others and utilizing CSS Grid. 
 * Contains conditional rendering logic to display specific views
 */
import React, { Component, JSX } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Toolbar from "./Toolbar";
import MailboxList from "./MailboxList";
import MessageList from "./MessageList";
import ContactList from "./ContactList";
import WelcomeView from "./WelcomeView";
import ContactView from "./ContactView";
import MessageView from "./MessageView";
import { createState } from "../state";

class BaseLayout extends Component<any, any> {
    // The state singleton is created here. All mutator functions inside `state.ts` 
    // will now trigger a re-render of this BaseLayout component when called.
    state: any = createState(this);

    render(): JSX.Element {
        return (
            <div className="appContainer">
                {/* A global loading spinner controlled by state.pleaseWaitVisible */}
                <Dialog open={this.state.pleaseWaitVisible} disableEscapeKeyDown={true} transitionDuration={0}>
                    <DialogTitle style={{ textAlign: "center" }}>Please Wait</DialogTitle>
                    <DialogContent>
                        <DialogContentText>...Contacting server...</DialogContentText>
                    </DialogContent>
                </Dialog>

                {/* Global Toolbar (New Message, New Contact) */}
                <div className="toolbar">
                    <Toolbar state={this.state} />
                </div>

                {/* Left Sidebar: Mailbox navigation */}
                <div className="mailboxList">
                    <MailboxList state={this.state} />
                </div>

                {/* Center column: Split into Top (Message List) and Bottom (The View Area) */}
                <div className="centerArea">
                    <div className="messageList">
                        <MessageList state={this.state} />
                    </div>
                    {/* Conditional Rendering: Only the component matching currentView is mounted to the DOM */}
                    <div className="centerViews">
                        {this.state.currentView === "welcome" && <WelcomeView />}
                        {(this.state.currentView === "message" || this.state.currentView === "compose") && <MessageView state={this.state} />}
                        {(this.state.currentView === "contact" || this.state.currentView === "contactAdd") && <ContactView state={this.state} />}
                    </div>
                </div>

                {/* Right Sidebar: Contact navigation */}
                <div className="contactList">
                    <ContactList state={this.state} />
                </div>
            </div>
        );
    }
}

export default BaseLayout;