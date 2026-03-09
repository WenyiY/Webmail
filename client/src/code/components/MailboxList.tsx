/**
 * A React component that is the list of mailboxes on the left
 * Iterates through mailboxes in state and displays them as selectable MUI Chip components
 */
import React, { JSX } from "react";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";

const MailboxList = ({ state }: any): JSX.Element => (
    <List>
        {state.mailboxes.map((value: any) => {
            return (
                <Chip label={`${value.name}`} onClick={() => state.setCurrentMailbox(value.path)}
                    style={{ width: 128, marginBottom: 10 }}
                    color={state.currentMailbox === value.path ? "secondary" : "primary"} key={value.path} />
            );
        })}
    </List>
);

export default MailboxList;