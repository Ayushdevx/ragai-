# CloneIT



🚀 CloneIT
Cursor AI + Figma + GPT, but built specifically for fast prototyping and real-time UI transformation.

## 📌 Problem Statement
Problem Statement 5 : Build the future of AI computer control with Screenpipe's- Terminator

## 🎯 Objective
CloneIT helps developers, designers, and businesses quickly clone any website UI, clean messy raw data, adapt elements using AI, and build faster without starting from scratch.
It streamlines the prototyping and web cloning process, saving time, enhancing design thinking, and enabling real-time UI transformation with AI.





Breakthroughs:

Built a full Chrome Extension + React Dashboard + NodeJS backend in parallel

Used ScreenPipe and Terminator to capture and process UI screens faster than traditional methods

Integrated Groq AI for smart UI adaptation

## 🛠️ Tech Stack
Core Technologies Used:

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB (via Mongoose, GridFS for file uploads)

APIs:

Groq AI (for contextual HTML understanding)

Gemini API (for design suggestions)

Hosting: Localhost / Vercel (Frontend), Render / Railway (Backend)

Sponsor Technologies Used:

✅ Groq: Prompted HTML content to suggest UI improvements and structure fixes

✅ Screenpipe: Used for screen capture and analyzing workflows

✅ Terminator: Helped clean and format messy DOM structures

(Monad, Base, Fluvio, Stellar were not used)

## ✨ Key Features
✅ Chrome Extension for Full Website Capture with the help of Terminator and ScreenPipe
✅ Analysis of raw data .cleaned and convert it into prompt to understand ui/ux by groq.
✅ Real-Time AI-Based UI Analysis and Adaptation
✅ Component Extraction and Reusability
✅ Capture History Management Dashboard
✅ Secure Authentication (Firebase)
✅ Snapshot and Project Organization (SnapClone Submodule)


## 📸 Screenshots

### Chrome Extension Capture Interface
![Extension Popup](./assets/extension-popup.png)

### Dashboard Overview
![Dashboard](./assets/Dashboard.png)

### Component Editing using AI
![Component Editor](./assets/component-editor.png)

## 📽️ Demo & Deliverables
Demo Video Link: [https://youtu.be/aJAFoneykKg?si=NetOr2ULwrkJz63Q]
Pitch Deck / PPT Link: [https://drive.google.com/file/d/1d3XfZLWjHB_RlrpeejGo-BSH3Sd2PjJv/view?usp=sharing]

## 🔒 API Keys and Environment Setup
GROQ_API_KEY="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"
MONGO_URI="mongodb+srv://mauryasumit8983:6ETE7c4GsEZwJiCE@cluster0.gbe8oqb.mongodb.net/"
GEMINI_API_KEY="AIzaSyDHgoARzeC2EVs24W8ymXkTSRjbfLxYIBk"

## 📊 APIs, Libraries & Acknowledgements
Screenpipe (Screen Analytics)

Terminator (Raw HTML Clean-up)

Groq API (AI processing for UI/UX)

HuggingFace Model (for natural language cleaning)

Research Papers (used for fine-tuning data cleaning workflows)

## ✅ Tasks & Bonus Checklist

- ✅ **All members of the team completed the mandatory task - Followed at least 2 of our social channels and filled the form** (Details in Participant Manual)  
- [ ] **All members of the team completed Bonus Task 1 - Sharing of Badges and filled the form (2 points)**  (Details in Participant Manual)
- ✅ **All members of the team completed Bonus Task 2 - Signing up for Sprint.dev and filled the form (3 points)**  (Details in Participant Manual)

## 🧪 How to Run the Project

### Requirements:
- Node.js v14+
- MongoDB
- Chrome browser (for extension)
- API Keys for Groq and Gemini

### Environment Setup:
Create a `.env` file in the Backend directory with:
```
GROQ_API_KEY=your_groq_api_key
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### Local Setup:
```bash
# Clone the repo
git clone https://github.com/Sumit2424/CloneIT.git
cd CloneIT

# Install Backend dependencies and start server
cd Backend
npm install
npm start

# In a new terminal, install Frontend dependencies and start dev server
cd Frontend
npm install
npm run dev

# Install Browser Extension:
# Open Chrome > chrome://extensions > Enable Developer Mode > Load Unpacked > Select BrowserExtension folder

#SnaPclone Ide 
# Snapclone IDE ->Frontend
cd SnapClone/frontend
npm install
npm run dev

#Snapclone Ide ->Backend
cd SnapClone/be
npm install
npm start

```


### Usage Notes:
- Frontend runs on http://localhost:5173 (or port specified by Vite)
- Backend API runs on http://localhost:5000
- Make sure both servers are running to use the application properly
- Chrome extension needs to be installed separately as described above

## 🧬 Future Scope

### Enhanced Automation
Implement deeper automation in processes to reduce manual intervention and improve efficiency.

### AI Integration
Integrate machine learning models for smarter decision-making, predictions, or personalization.

### User Personalization
Add features that tailor the experience based on user behavior and preferences.

### Cross-Platform Support
Extend compatibility across more devices and platforms (e.g., mobile apps, tablets).

## 📎 Resources & Credits

### APIs & Services
- **Groq API**: Used for AI-powered HTML analysis and recommendations
- **Gemini API**: Implemented for generating design suggestions and UI improvements
- **Firebase Authentication**: For secure user authentication and management
- **MongoDB Atlas**: Database service for storing project data and metadata

### Open Source Libraries
- **React.js**: Frontend framework for building the user interface
- **Express.js**: Backend server framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **html2canvas**: JavaScript library for capturing web page screenshots
- **GridFS**: MongoDB's system for storing and retrieving large files
- **Mongoose**: MongoDB object modeling tool for Node.js

### Tools & Technologies
- **ScreenPipe**: Screen capture and analysis tool by Replit
- **Terminator**: HTML/DOM cleaning and parsing utility
- **Chrome Extension API**: Used for building the browser extension
- **Vite**: Frontend build tool and development server

