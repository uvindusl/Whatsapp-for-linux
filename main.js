const { app, Notification } = require("electron/main");
const { loadWhatsApp } = require("./src/window");
const { createTrayIconFor } = require("./src/tray");
const { clearServiceWorkers } = require("./src/session");

let window;
let tray;

const isFirstInstance = app.requestSingleInstanceLock();

app.disableHardwareAcceleration();

if (!isFirstInstance) {
  app.quit();
  return;
}

app.on("second-instance", () => {
  if (window) {
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  }
});

const startApp = () => {
  window = loadWhatsApp();
  tray = createTrayIconFor(window, app);
  if (Notification && typeof Notification.on === "function") {
    Notification.on("click", () => {
      console.log("Notification clicked!");
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.show();
        window.focus();
      }
    });
  } else {
    console.warn(
      "Electron's 'Notification.on(\"click\")' is not available or functional. Notification clicks may not open the app directly."
    );
    console.warn(
      "This is often due to running in a confined environment (e.g., Flatpak, Snap) using Portal notifications."
    );
  }
};

app.on("ready", startApp);
app.on("before-quit", clearServiceWorkers);
app.on("window-all-closed", () => app.quit());
