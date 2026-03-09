"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverInfo = void 0;
/**
 * Configuration file that provides details about the IMAP and SMTP server(s)
 * the server will connect to and where that information will be stored
 */
const path = require("path");
const fs = require("fs");
// Read the serverInfo.json file in and 
// create an object that adheres to the IServerInfo interface and 
// that the serverInfo variable points to
const rawInfo = fs.readFileSync(path.join(__dirname, "../serverInfo.json"));
exports.serverInfo = JSON.parse(rawInfo);
//# sourceMappingURL=ServerInfo.js.map