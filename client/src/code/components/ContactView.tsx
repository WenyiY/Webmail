/**
 * The enhanced Contact View component that allows users to add a new contact 
 * OR exclusively update/delete an existing contact dynamically (New Feature)
 */
import React, { JSX } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const ContactView = ({ state }: any): JSX.Element => (
    <form>
        {/* NEW FEATURE: Removed disabled={true} to allow editing of existing contacts */}
        <TextField margin="dense" id="contactName" label="Name" value={state.contactName} variant="outlined"
            InputProps={{ style: { color: "#000000" } }} style={{ width: 260 }}
            onChange={state.fieldChangeHandler}
        />
        <br />
        <TextField margin="dense" id="contactEmail" label="Email" value={state.contactEmail} variant="outlined"
            InputProps={{ style: { color: "#000000" } }} style={{ width: 520 }}
            onChange={state.fieldChangeHandler}
        />
        <br />

        {state.currentView === "contactAdd" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }} onClick={state.saveContact}>Save</Button>
        }

        {state.currentView === "contact" &&
            <>
                {/* NEW FEATURE: Update Button */}
                <Button variant="contained" color="secondary" size="small" style={{ marginTop: 10, marginRight: 10 }} onClick={state.updateContact}>Update</Button>
                <Button variant="contained" color="primary" size="small" style={{ marginTop: 10, marginRight: 10 }} onClick={state.deleteContact}>Delete</Button>
                <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }} onClick={() => state.showComposeMessage("contact")}>Send Email</Button>
            </>
        }
    </form>
);

export default ContactView;