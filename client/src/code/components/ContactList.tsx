/**
 * New Feature
 * Displays the local contact list on the right-hand side using MUI Avatars
 */
import React, { JSX } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Person from "@mui/icons-material/Person";

const ContactList = ({ state }: any): JSX.Element => (
    <List>
        {state.contacts.map((value: any) => {
            return (
                <ListItem key={value._id} button onClick={() => state.showContact(value._id, value.name, value.email)}>
                    <ListItemAvatar>
                        <Avatar><Person /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${value.name}`} />
                </ListItem>
            );
        })}
    </List>
);

export default ContactList;