# Unofficial WhatsApp for Ubuntu

This repository hosts an unofficial WhatsApp desktop application specifically optimized for Ubuntu, providing a seamless messaging experience directly from your desktop.

## Features

* **Optimized Performance:** Built with performance in mind for a smooth experience on Ubuntu.

* **Native Feel:** Integrates well with the Ubuntu desktop environment.

* **All Core WhatsApp Features:** Supports sending and receiving messages, photos, videos, documents, and voice messages.

* **Desktop Notifications:** (Known issue: Small bug in notifications - see "Known Issues" below) Receive desktop notifications for new messages.

## Installation

You can install the Unofficial WhatsApp for Ubuntu by either downloading a pre-built release or building it from source.

### Option 1: Download from Releases (Recommended)

1.  Go to the [Releases page](https://github.com/uvindusl/Whatsapp-for-linux/releases) of this repository.

2.  Download the latest `.deb` package for your system.

3.  Install the package using your system's package installer or via the command line:

    ```bash
    sudo dpkg -i whatsapp-for-linux_*.deb
    sudo apt install -f # To fix any broken dependencies
    ```

### Option 2: Build from Source

To build the application from source, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/uvindusl/Whatsapp-for-linux.git
    cd Whatsapp-for-linux
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

    * **Note:** You might need to install `npm` or `yarn` if you don't have them already.

3.  **Build the application:**

    ```bash
    npm run build
    ```

    This command will typically create distributable packages (like `.deb`) in the `dist` folder.

4.  **Run the application (for development/testing):**

    ```bash
    npm run start
    ```

## Usage

Once installed, launch the application from your applications menu. You'll be prompted to scan a QR code using your phone's WhatsApp application (WhatsApp Web/Desktop option) to link your account.

## Known Issues

* **Notification Bug:** There's a small bug affecting desktop notifications. While notifications generally appear, when you click on them, the application will not open or come into focus. I am actively working on a fix for this.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/uvindusl/Whatsapp-for-linux/blob/32636ef5431d0e5b919542de43317ac300479863/LICENSE) file for details.
