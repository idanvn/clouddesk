<div align="center">

# 🚀 Google Drive & Gmail Manager

### Manage your Google Drive & Gmail like a pro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**One powerful tool to organize, clean, and manage your Google workspace.**

[Getting Started](#-quick-start) •
[Features](#-features) •
[Tech Stack](#%EF%B8%8F-tech-stack) •
[Contributing](#-contributing)

</div>

---

## 😫 The Problem

We've all been there:

- **Cluttered Drive** — Thousands of files you can't find
- **Overflowing Inbox** — 10,000+ unread emails haunting you
- **Wasted Storage** — "Storage full" notifications on repeat
- **Manual Cleanup** — Hours spent deleting files one by one
- **No Overview** — No idea what's eating your 15GB

## ✨ The Solution

**Google Drive & Gmail Manager** gives you superpowers:

- Bulk delete old files and emails in seconds
- Visualize what's consuming your storage
- Smart search across Drive and Gmail
- Organize with one click
- All from one beautiful dashboard

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 📁 Google Drive
- **Smart Search** — Find any file instantly
- **Bulk Operations** — Delete, share, organize multiple files
- **Storage Analytics** — See what's eating your space
- **Quick Preview** — View files without leaving the app
- **Drag & Drop** — Easy file organization
- **Star Management** — Quick access to important files

</td>
<td width="50%">

### 📧 Gmail
- **Inbox Overview** — See all emails at a glance
- **Bulk Delete** — Clean old emails in seconds
- **Spam Cleaner** — One-click spam removal
- **Label Management** — Create and organize labels
- **Archive Tools** — Declutter without deleting
- **Unread Counter** — Know your inbox status

</td>
</tr>
</table>

### More Highlights

| Feature | Description |
|---------|-------------|
| 🛡️ **Privacy First** | Runs 100% locally — your data never leaves your machine |
| ⚡ **Lightning Fast** | Built with Vite for instant loading |
| 🎨 **Modern UI** | Beautiful glassmorphism design with smooth animations |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 🔒 **Secure** | OAuth 2.0 authentication, no passwords stored |
| 🌙 **Dark Mode** | Easy on the eyes (coming soon) |

---

## 🚀 Quick Start

Get up and running in **3 simple steps**:

```bash
# 1. Clone the repository
git clone https://github.com/idanvn/clouddesk.git
cd clouddesk

# 2. Install dependencies
npm install

# 3. Start the app
npm run dev
```

Then open **http://localhost:5173** in your browser.

> ⚠️ **First time?** You'll need to set up Google API credentials. See [Configuration](#%EF%B8%8F-configuration) below.

---

## 🐳 Docker Deployment

Prefer Docker? We've got you covered:

```bash
# Build and run with Docker Compose
docker compose up -d

# App will be available at http://localhost:5343
```

Or build manually:

```bash
docker build -t google-manager .
docker run -p 5343:3000 google-manager
```

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## ⚙️ Configuration

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Drive API** and **Gmail API**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - Your production URL

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
```

### 3. Run the App

```bash
npm run dev
```

<details>
<summary>📖 Detailed Setup Guide (Click to expand)</summary>

#### Creating OAuth Credentials

1. In Google Cloud Console, navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5343
   ```
5. Add authorized redirect URIs (same as above)
6. Click **Create** and copy your Client ID

#### Creating API Key

1. In **Credentials**, click **Create Credentials** > **API Key**
2. Copy the API Key
3. Click **Restrict Key** and limit to:
   - Google Drive API
   - Gmail API
4. Add HTTP referrer restrictions for production

</details>

---

## 🛠️ Tech Stack

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

</div>

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI framework with concurrent features |
| **Vite** | 7 | Next-generation build tool |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Framer Motion** | 12 | Smooth animations |
| **Lucide Icons** | Latest | Beautiful open-source icons |
| **Google APIs** | v3/v1 | Drive & Gmail integration |

---

## 🔒 Security

This application takes security seriously:

- ✅ **OAuth 2.0** with CSRF protection
- ✅ **Input validation** on all user inputs
- ✅ **Rate limiting** to prevent API abuse
- ✅ **Content Security Policy** headers
- ✅ **No data storage** — everything stays with Google
- ✅ **Secure logging** — no sensitive data in production logs

See [SECURITY.md](SECURITY.md) for detailed security documentation.

---

## 👥 Who Is This For?

<table>
<tr>
<td align="center">👨‍💼<br><b>Workspace Admins</b><br>Tired of manual cleanup</td>
<td align="center">📧<br><b>Email Overloaders</b><br>Drowning in 10k+ emails</td>
<td align="center">👥<br><b>Teams</b><br>Needing better organization</td>
<td align="center">💾<br><b>Storage Savers</b><br>Wanting to reclaim space</td>
</tr>
</table>

---

## 🗺️ Roadmap

We're just getting started! Here's what's coming:

- [ ] 📅 **Google Calendar Integration** — Manage events
- [ ] ⏰ **Scheduled Auto-Cleanup** — Set it and forget it
- [ ] 📊 **Analytics Dashboard** — Deep storage insights
- [ ] 🧩 **Chrome Extension** — Manage from anywhere
- [ ] 📱 **Mobile App** — iOS & Android versions
- [ ] 🤖 **AI Suggestions** — Smart cleanup recommendations

Have an idea? [Open a feature request](https://github.com/idanvn/clouddesk/issues/new)!

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

```bash
# 1. Fork the repo

# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'Add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🐛 Troubleshooting

<details>
<summary><b>"Google API not loaded" error</b></summary>

- Check your internet connection
- Ensure Google API script is not blocked by ad blockers
- Try a different browser
</details>

<details>
<summary><b>"Failed to initialize Google API" error</b></summary>

- Verify your API Key in `.env`
- Ensure Drive API and Gmail API are enabled
- Check that credentials are not restricted incorrectly
</details>

<details>
<summary><b>OAuth consent screen errors</b></summary>

- Add `http://localhost:5173` to authorized origins
- For development, add yourself as a test user
- Make sure the OAuth consent screen is configured
</details>

---

## 💬 Community & Support

- ⭐ **Star this repo** if you find it useful
- 🐛 **[Report bugs](https://github.com/idanvn/clouddesk/issues)** — Help us improve
- 💡 **[Request features](https://github.com/idanvn/clouddesk/discussions)** — Share your ideas
- 📖 **[Read the docs](https://github.com/idanvn/clouddesk/wiki)** — Learn more

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

### ⭐ Star us on GitHub — it motivates us a lot!

---

**Built with ❤️ using React, Vite, and Tailwind CSS**

[⬆ Back to Top](#-google-drive--gmail-manager)

</div>
