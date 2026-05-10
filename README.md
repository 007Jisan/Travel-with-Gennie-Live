# 🌍 ExploreWithGenie - AI-Powered Travel Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/AI-OpenAI_API-412991?style=flat-square&logo=openai)

Welcome to **ExploreWithGenie**, a comprehensive full-stack travel booking and management platform. Designed to bridge the gap between tourists and travel agencies, this platform features an intelligent AI assistant, a gamified review system, and a smart recommendation engine.

## 🚀 Live Demo
**[Click Here to Visit the Live Website](https://travel-with-gennie-live.onrender.com)**

---

## 🎯 Key Features
* **🤖 AI Travel Assistant ("Genie"):** Bilingual (English & Bengali) chatbot powered by OpenAI, offering instant travel advice and support.
* **🔐 Role-Based Access Control:** Secure, customized dashboards for **Admin**, **Agency**, and **Tourist** roles.
* **🎮 Gamification & Leaderboard:** Users earn points for sharing authentic reviews on travel spots, fueling a dynamic global leaderboard.
* **🧠 Smart Recommendations:** Personalized travel suggestions dynamically generated based on search history, budget, and trip duration.
* **🔔 Real-Time Notifications:** Instant polling-based alerts for booking status updates (Approvals/Rejections).
* **🌐 Seamless Localization:** Built-in toggle to switch between English and Bengali interfaces instantly using React Context API.

---

## 🛠️ Technology Stack
* **Frontend:** React.js, Tailwind CSS, React Router DOM
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **AI Integration:** OpenAI API (Nemotron Model via OpenRouter)
* **Deployment:** Render (Monolithic Architecture)

---

## 💼 Guide for Recruiters & Reviewers
To fully explore the platform's capabilities, please follow this quick guide. You can register new accounts to test the different role-based functionalities:

### 1. Tourist Role
* **How to test:** Click on "Sign Up" and register a new account selecting the "Tourist" role.
* **Features to check:** Talk to the AI Genie (in English or Bengali), browse premium spots, leave a review to earn reward points, check your rank on the Leaderboard, and send a booking request to an agency.

### 2. Agency Role
* **How to test:** Register a new account selecting the "Agency" role.
* **Features to check:** Access the agency dashboard to manage tour packages, view incoming booking requests from tourists, and approve/reject them to trigger real-time notifications for the tourist.

### 3. Admin Role
* **How to test:** Register an account and assign admin privileges (or use pre-configured admin credentials).
* **Features to check:** Monitor user activities across the platform, manage the global review system, and maintain platform guidelines.

*(Note: The platform features a 10MB image upload limit. Please use sample images when testing the profile or review functionalities.)*

---

## ⚙️ Run Locally
If you want to test the application on your local environment:

1. Clone the repository:
   ```bash
   git clone [https://github.com/007Jisan/Travel-with-Gennie-Live.git](https://github.com/007Jisan/Travel-with-Gennie-Live.git)

2.Install dependencies:
Bash
npm install
reate a .env file in the root directory and add the following keys:

3.Code snippet:
PORT=5000
MONGO_URL=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret


4.Start the development server:
Bash
node server.js
5.Open your browser and navigate to http://localhost:5000.

Developed with ❤️ by Jisan


   
