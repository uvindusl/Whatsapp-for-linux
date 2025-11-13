const { app, BrowserWindow, ipcMain } = require("electron");
const { loadWhatsApp, sendNotification } = require("./src/window");
const { createTrayIconFor } = require("./src/tray");
const { clearServiceWorkers } = require("./src/session");
const path = require("path");
const AutoLaunch = require("auto-launch");

let mainWindowInstance;
let tray;

const isFirstInstance = app.requestSingleInstanceLock();

app.disableHardwareAcceleration();

if (!isFirstInstance) {
  app.quit();
  return;
}

app.on("second-instance", () => {
  if (mainWindowInstance) {
    if (mainWindowInstance.isMinimized()) {
      mainWindowInstance.restore();
    }
    mainWindowInstance.show();
    mainWindowInstance.focus();
  }
});

const createAndLoadMainWindow = () => {
  const shouldStartHidden = process.argv.includes("--hidden");

  mainWindowInstance = loadWhatsApp({ show: !shouldStartHidden });
  tray = createTrayIconFor(mainWindowInstance, app);
};

app.whenReady().then(() => {
  createAndLoadMainWindow();

  const yourAppName = "WhatsappDesktop";

  const autoLauncher = new AutoLaunch({
    name: yourAppName,
    path: app.getPath("exe"),
    isHidden: true,
  });

  autoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      autoLauncher
        .enable()
        .then(() => {
          console.log("Auto-launch enabled successfully.");
        })
        .catch((err) => {
          console.error("Failed to enable auto-launch:", err);
        });
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && !mainWindowInstance) {
      createAndLoadMainWindow();
    } else if (mainWindowInstance) {
      if (mainWindowInstance.isMinimized()) {
        mainWindowInstance.restore();
      }
      mainWindowInstance.show();
      mainWindowInstance.focus();
    }
  });
});

app.on("before-quit", clearServiceWorkers);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(
  "whatsapp-notification-from-renderer",
  (event, { title, body, icon }) => {
    sendNotification(title, body, icon);
  }
);

ipcMain.on("update-badge-count", (event, count) => {
  if (app.isReady() && app.setBadgeCount) {
    app.setBadgeCount(count);
    if (
      process.platform === "darwin" &&
      count > 0 &&
      !mainWindowInstance.isFocused()
    ) {
      app.dock.bounce("informational");
    }
  }
});
