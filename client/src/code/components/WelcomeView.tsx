/**
 * A React component that serves as just a simple splash screen 
 * when the app starts up or when certain operations occur
 * (A simple fallback display for when no message or contact is selected))
 */
import React, { JSX } from "react";

const WelcomeView = (): JSX.Element => (
    <div style={{ position: "relative", top: "40%", textAlign: "center", color: "#ff0000" }}>
        <h1>Welcome to MailBag!</h1>
    </div>
);

export default WelcomeView;