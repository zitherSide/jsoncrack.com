"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_next_1 = __importDefault(require("electron-next"));
const path_1 = require("path");
const url_1 = require("url");
electron_1.app.on("ready", async () => {
    await (0, electron_next_1.default)(".");
    const mainWindow = new electron_1.BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            preload: (0, path_1.join)(__dirname, "preload.ts"),
        },
    });
    mainWindow.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        electron_1.shell.openExternal(url);
    });
    const url = electron_is_dev_1.default
        ? "http://localhost:8000/editor"
        : (0, url_1.format)({
            pathname: (0, path_1.join)(__dirname, "../out/editor.html"),
            protocol: "file:",
            slashes: true,
        });
    mainWindow.loadURL(url);
});
electron_1.app.on("window-all-closed", electron_1.app.quit);
