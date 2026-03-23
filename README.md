# MailBag: Full-Stack Webmail & Contact Manager

## 📖 Overview
MailBag is a modern, responsive Single Page Application (SPA) that functions as a fully operational webmail client. It allows users to connect to standard mail servers to read emails, compose new messages, and manage a local address book of contacts. 

This project demonstrates a complete end-to-end TypeScript architecture, featuring a React frontend with centralized state management and a Node.js/Express backend that interfaces directly with external mail servers using standard network protocols.

## Key Features
* **Email Retrieval (IMAP):** Dynamically fetches mailbox folders and message payloads from remote mail servers.
* **Email Transmission (SMTP):** Composes and securely dispatches emails to external recipients.
* **Contact Management (CRUD):** Embedded NoSQL database enables users to create, read, update, and delete contacts locally.
* **Centralized State Management:** Custom, lightweight state management pattern ensuring UI synchronization without prop-drilling.
* **Cross-Origin Resource Sharing (CORS):** Securely configured middleware facilitating asynchronous API communication between the React client and Express server.

## Tech Stack
**Frontend:**
* React (Function & Class Components)
* TypeScript
* Axios (AJAX / RESTful communication)
* Webpack & Webpack Dev Server (Bundling and local development)

**Backend:**
* Node.js & Express.js
* TypeScript
* NeDB (Embedded NoSQL document store)
* `emailjs-imap-client` & `mailparser` (IMAP integration)
* `nodemailer` (SMTP integration)

## Project Architecture
```bash
mailbag/
├── client/                 # React SPA Frontend
│   ├── src/
│   │   ├── code/           # Core logic (state.ts, Workers, config)
│   │   ├── components/     # React UI Components (BaseLayout, MessageList, etc.)
│   │   └── index.tsx       # Application entry point
│   ├── webpack.config.js   # Build configuration
│   └── tsconfig.json       
└── server/                 # Express REST API Backend
    ├── src/
    │   ├── main.ts         # Express router and endpoints
    │   ├── contacts.ts     # NeDB database worker
    │   ├── IMAP.ts         # IMAP retrieval worker
    │   └── SMTP.ts         # SMTP transmission worker
    └── tsconfig.json
```

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v14 or higher)
* A valid email account with IMAP/SMTP access enabled (e.g., Gmail with an "App Password").

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/WenyiY/Webmail.git
   ```
2. Set up the Backend (Express/Node.js):
   ```bash
   cd server
   npm install
   ```
3. Set up the Frontend (React/TypeScript):
   ```bash
   cd client
   npm install
   ```
### Run the application
1. Start the Backend Server:
   ```bash
   cd server
   npm run build
   npm start
   # The server will run on http://localhost:8080
   ```
2. Start the Frontend Client:
   ```bash
   cd client
   npx webpack serve
   # The frontend will be served at http://localhost:8081 (or your configured port)
   ```
