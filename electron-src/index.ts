import { BrowserWindow, app, shell } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { join } from "path";
import { format } from "url";

app.on("ready", async () => {
  await prepareNext(".");

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, "preload.ts"),
    },
  });

  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  const url = isDev
    ? "http://localhost:8000/editor"
    : format({
        pathname: join(__dirname, "../out/editor.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.loadURL(url);
});

app.on("window-all-closed", app.quit);
