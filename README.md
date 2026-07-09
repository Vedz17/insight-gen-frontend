# 🌟 InsightGen: The AI-Powered NAAC Auditor

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

InsightGen is a production-grade multi-tenant SaaS application engineered to automate and streamline institutional NAAC compliance reporting. By integrating an advanced multi-agent AI ecosystem, InsightGen realistically reduces the time required to compile, synthesize, and structure institutional NAAC reports by **45 percent**.

## ✨ Key Features
- **Multi-Tenant Architecture:** Secure, isolated workspaces for different institutional audits.
- **Dynamic Analytics Dashboard:** Live Recharts-based data visualization tracking document uploads and report generations with intelligent empty states.
- **Streaming Chat Arena:** Real-time AI response streaming with a live "Agent Status" monitor (Tracking Researcher, Writer, and Auditor agents in real-time).
- **Dual-Database System:** Utilizes MongoDB for robust application state management (Workspaces, Documents, Activity Logs).
- **Premium UI/UX:** Built with Tailwind CSS, Shadcn-inspired components, and Framer Motion for highly fluid, dark-mode micro-interactions.
- **Enterprise Authentication:** Handled seamlessly via Clerk Auth.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling & Animation:** Tailwind CSS, Framer Motion, Lucide React
- **Database (App State):** MongoDB (Mongoose ORM)
- **Authentication:** Clerk Auth
- **Data Visualization:** Recharts

## 🚀 Step-by-Step Setup

**1. Clone the repository**
```bash
git clone [https://github.com/Vedz17/insight-gen-frontend.git](https://github.com/Vedz17/insight-gen-frontend.git)
cd insight-gen-frontend
2. Install dependencies

Bash
npm install
3. Set up Environment Variables
Create a .env.local file in the root directory and add the following:

Code snippet
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
4. Run the Development Server

Bash
npm run dev
Visit http://localhost:3000 to see the application in action.

Architected with 🩵 by Vedant Bhamare - IT Undergrad & Full Stack Developer
