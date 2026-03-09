/**
 * A React component that is the presentation of a message or when a message is being composed
 * Acts as both the email reader and the new email composer, 
 * selectively disabling/enabling fields based on the currentView state
 */
import React, { JSX } from "react";
import InputBase from "@mui/material/InputBase";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const MessageView = ({ state }: any): JSX.Element => (
    <form>
        {state.currentView === "message" &&
            <InputBase defaultValue={`ID ${state.messageID}`} margin="dense" disabled={true} fullWidth={true} className="messageInfoField" />
        }
        {state.currentView === "message" && <br />}
        {state.currentView === "message" &&
            <InputBase defaultValue={state.messageDate} margin="dense" disabled={true} fullWidth={true} className="messageInfoField" />
        }
        {state.currentView === "message" && <br />}
        {state.currentView === "message" &&
            <TextField margin="dense" variant="outlined" fullWidth={true} label="From" value={state.messageFrom} disabled={true} InputProps={{ style: { color: "#000000" } }} />
        }
        {state.currentView === "message" && <br />}

        {state.currentView === "compose" &&
            <TextField margin="dense" id="messageTo" variant="outlined" fullWidth={true} label="To" value={state.messageTo} InputProps={{ style: { color: "#000000" } }} onChange={state.fieldChangeHandler} />
        }
        {state.currentView === "compose" && <br />}

        <TextField margin="dense" id="messageSubject" label="Subject" variant="outlined" fullWidth={true} value={state.messageSubject} disabled={state.currentView === "message"} InputProps={{ style: { color: "#000000" } }} onChange={state.fieldChangeHandler} />
        <br />

        <TextField margin="dense" id="messageBody" variant="outlined" fullWidth={true} multiline={true} rows={12} value={state.messageBody} disabled={state.currentView === "message"} InputProps={{ style: { color: "#000000" } }} onChange={state.fieldChangeHandler} />

        {state.currentView === "compose" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }} onClick={state.sendMessage}>Send</Button>
        }
        {state.currentView === "message" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10, marginRight: 10 }} onClick={() => state.showComposeMessage("reply")}>Reply</Button>
        }
        {state.currentView === "message" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }} onClick={state.deleteMessage}>Delete</Button>
        }
    </form>
);

export default MessageView;