const { Tray, Menu, MenuItem, nativeImage } = require("electron");
const path = require("path");

function getTrayIcon() {
  let iconPath;
  if (process.env.SNAP) {
    iconPath = path.join(process.env.SNAP, "bin", "assets", "512x512.png");
  } else {
    iconPath = path.join(__dirname, "../assets/512x512.png");
  }
  return nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 });
}

function createTrayIconFor(window, app) {
  const tray = new Tray(getTrayIcon());

  const showWindowMenuItem = new MenuItem({
    label: "Show Window",
    click: () => {
      if (window) {
        if (window.isVisible()) {
          window.focus();
        } else {
          window.show();
        }
      }
    },
  });

  const quitAppMenuItem = new MenuItem({
    label: "Quit",
    click: () => {
      if (window) {
        window.destroy();
      }
      app.quit();
    },
  });

  const contextMenu = Menu.buildFromTemplate([
    showWindowMenuItem,
    { type: "separator" },
    quitAppMenuItem,
  ]);

  tray.setContextMenu(contextMenu);

  return tray;
}

module.exports = { createTrayIconFor };
