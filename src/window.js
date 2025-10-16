const { BrowserWindow, shell, Notification } = require("electron");
const path = require("path");

const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.131 Safari/537.36";

let mainWindow;

function loadWhatsApp(options = {}) {
  const { show = true } = options;

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, "../assets/512x512.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: show,
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.once("did-finish-load", () => {
    console.log(
      "Main window finished loading web content. Triggering initial badge update."
    );
    mainWindow.webContents
      .executeJavaScript("window.whatsappApi.triggerInitialBadgeUpdate();")
      .catch((error) =>
        console.error("Error triggering initial badge update:", error)
      );

    checkNotificationPermission();
    setupExternalLinkHandling(mainWindow.webContents);
  });

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
    console.log("Window 'close' event: Window hidden.");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    console.log(
      "Window 'closed' event: Window instance destroyed and set to null."
    );
  });

  mainWindow.loadURL("https://web.whatsapp.com/", { userAgent });

  return mainWindow;
}

function setupExternalLinkHandling(webContents) {
  webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalLink(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

function isExternalLink(url) {
  const whatsappDomains = [
    "whatsapp.com",
    "web.whatsapp.com",
    "chat.whatsapp.com",
  ];
  return !whatsappDomains.some((domain) => url.includes(domain));
}

function checkNotificationPermission() {
  if (Notification.isSupported()) {
    console.log("Native OS Notifications are supported.");
  } else {
    console.log("Native OS Notifications are not supported on this system.");
  }
}

function sendNotification(title, body, iconPath) {
  if (Notification.isSupported()) {
    const notificationOptions = {
      title: title || "WhatsApp Notification",
      body: body || "You have a new message.",
      icon: iconPath || path.join(__dirname, "../assets/512x512.png"),
      silent: false,
    };

    const notification = new Notification(notificationOptions);

    notification.on("click", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
      } else {
        console.log(
          "Notification clicked, but main window was closed. Cannot show."
        );
      }
    });
    notification.show();
  }
}

module.exports = { loadWhatsApp, sendNotification };
