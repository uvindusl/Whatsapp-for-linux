const { contextBridge, ipcRenderer, Notification } = require("electron");
window.addEventListener("DOMContentLoaded", () => {
  const OriginalNotification = window.Notification;

  window.Notification = function (title, options) {
    ipcRenderer.send("whatsapp-notification-from-renderer", {
      title: title,
      body: options.body || "",
      icon: options.icon || "",
    });

    return new OriginalNotification(title, options);
  };

  window.Notification.requestPermission =
    OriginalNotification.requestPermission;
  window.Notification.permission = OriginalNotification.permission;
  window.Notification.maxActions = OriginalNotification.maxActions;

  function getUnreadCountFromTitle() {
    const match = document.title.match(/^\((\d+)\)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  let lastSentCount = -1;
  const sendBadgeCount = () => {
    const currentCount = getUnreadCountFromTitle();
    if (currentCount !== lastSentCount) {
      ipcRenderer.send("update-badge-count", currentCount);
      lastSentCount = currentCount;
    }
  };

  const titleElement = document.querySelector("head > title");
  if (titleElement) {
    const observer = new MutationObserver(sendBadgeCount);

    observer.observe(titleElement, {
      characterData: true,
      subtree: true,
      childList: true,
    });
  } else {
    console.warn(
      "Title element not found directly, observing head for title changes. Initial count might be delayed."
    );
    const observer = new MutationObserver(sendBadgeCount);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
  contextBridge.exposeInMainWorld("whatsappApi", {
    triggerInitialBadgeUpdate: () => {
      sendBadgeCount();
    },
  });
});
