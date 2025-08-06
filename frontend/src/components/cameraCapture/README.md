# Camera Capture React Component

This project is a responsive React component that captures webcam frames every 30 seconds (4 consecutive frames), sends them to a backend API (if available), and stores them locally in memory as a fallback. A download option is provided to manually retrieve unsent frames.

## Features

- Accesses user camera (PC and mobile friendly)
- Captures 4 frames every 30 seconds
- Sends frames to a backend API
- Fallback: stores frames in memory if API is unreachable
- Optional download button for stored frames
- Responsive design (mobile + desktop)

##  Tech Stack

- ReactJS (with Hooks)
- JavaScript (ES6+)
- HTML5 Video & Canvas APIs
- Environment Variables (.env)
- CSS (basic styling)

## Project Structure

src/
├── components/
│ └── CameraCapture.jsx
├── styles/
│ └── CameraCapture.css
├── App.js
└── index.js


## ⚙️ Setup Instructions

### 1. Clone the repository

```bash

git clone https://dev.azure.com/AI2025/_git/Project%20B
cd Project%20B/frontend/camera-frame-capture
```

### 2. Create and switch to a new feature branch

```bash
git checkout -b saifsabelaish/feature-camera-capture
```

###  3. Install dependencies

```bash
npm install
```
### 4. Configure the API

Create a .env file in the root of the project:

VITE_API_URL=https://your-api-endpoint.com/upload

### 5. Run the app locally (development)

```bash
npm run dev
```

### Open http://localhost:3000 in your browser to view it.

