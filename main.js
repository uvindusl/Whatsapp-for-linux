const { app, BrowserWindow, ipcMain } = require("electron");
const { loadWhatsApp, sendNotification } = require("./src/window"); // Make sure this path is correct
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
  // Determine if the window should start hidden based on command-line arguments
  // This is crucial for auto-launch with isHidden: true
  const shouldStartHidden = process.argv.includes("--hidden");

  // Pass the 'show' option to loadWhatsApp
  mainWindowInstance = loadWhatsApp({ show: !shouldStartHidden });
  tray = createTrayIconFor(mainWindowInstance, app);
};

app.whenReady().then(() => {
  createAndLoadMainWindow();

  // IMPORTANT: Replace "YourWhatsAppAppName" with the actual name of your app
  // as defined in your package.json (the "name" field).
  // This name is used by auto-launch to identify your application.
  const yourAppName = "WhatsappDesktop"; // Example: If your package.json name is "whatsapp-desktop"

  const autoLauncher = new AutoLaunch({
    name: yourAppName,
    path: app.getPath("exe"), // This gets the path to your executable
    isHidden: true, // This tells auto-launch to pass '--hidden' as an argument
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
    // On macOS, when the dock icon is clicked and no windows are open,
    // we should re-create a window or show the existing one.
    if (BrowserWindow.getAllWindows().length === 0 && !mainWindowInstance) {
      // If there are no windows and no main window instance, create one
      // In this case, you usually want it to show
      createAndLoadMainWindow();
    } else if (mainWindowInstance) {
      // If there's an instance, ensure it's visible and focused
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
  // On macOS, applications typically stay active until the user quits explicitly with Cmd + Q
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
