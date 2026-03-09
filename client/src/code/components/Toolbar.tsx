/**
 * A React component that is the toolbar
 * Houses the "New Message" and "New Contact" global actions
 */
import React, { JSX } from "react";
import Button from "@mui/material/Button";
import NewMessageIcon from "@mui/icons-material/Email";
import NewContactIcon from "@mui/icons-material/ContactMail";

const Toolbar = ({ state }: any): JSX.Element => (
    <div>
        <Button variant="contained" color="primary" size="small" style={{ marginRight: 10 }} onClick={() => state.showComposeMessage("new")}>
            <NewMessageIcon style={{ marginRight: 10 }} />New Message
        </Button>
        <Button variant="contained" color="primary" size="small" style={{ marginRight: 10 }} onClick={state.showAddContact}>
            <NewContactIcon style={{ marginRight: 10 }} />New Contact
        </Button>
    </div>
);

export default Toolbar;