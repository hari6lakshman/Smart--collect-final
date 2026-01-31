# Smart Collect

A modern debt collection management system powered by AI, built with Next.js and Google Gemini.

## 🚀 Features

- **Admin Dashboard**: Comprehensive case management and analytics
- **AI-Powered Prioritization**: Intelligent case prioritization using Google Gemini
- **DCA Management**: Manage debt collection agents and their performance
- **Timetable Scheduling**: Schedule and track tasks for collection agents
- **Real-time Analytics**: Monitor cases, recovery rates, and agent performance
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.9 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **AI**: Google Genkit with Gemini 2.5 Flash
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Animations**: Motion (Framer Motion)

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- Google AI API Key ([Get one here](https://aistudio.google.com/app/apikey))

## 🏃 Running Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Or use the provided batch file:
   ```bash
   START_SERVER.bat
   ```

4. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 🔐 Login Credentials

### Admin
- **Username**: `admin.com`
- **Password**: `admin@123`

### DCA (Sample)
- Check the initial data in `src/lib/data.ts` for DCA credentials

## 

3. **Configure environment variables**
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

## 📁 Project Structure

```
smart-collect/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (app)/        # Protected routes
│   │   │   ├── admin/    # Admin dashboard
│   │   │   ├── dca/      # DCA dashboard
│   │   │   └── layout.tsx
│   │   ├── about/        # About page
│   │   ├── login/        # Login page
│   │   └── page.tsx      # Landing page
│   ├── ai/               # AI flows and configuration
│   │   ├── flows/        # Genkit AI flows
│   │   └── genkit.ts     # AI setup
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── animations/   # Custom animations
│   ├── context/          # React context
│   ├── lib/              # Utilities and data
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
├── .env.local           # Environment variables (create this)
└── package.json         # Dependencies
```

## 🎨 Key Features Explained

### AI-Powered Case Prioritization
Uses Google Gemini to analyze:
- Overdue aging
- Due amount
- Recovery rate
- Historical payment behavior

### DCA Performance Analysis
AI analyzes agent performance and provides:
- Performance summary
- Recommended case assignments
- Improvement suggestions

### Timetable Management
- Schedule tasks for agents
- Edit and remove scheduled tasks
- View tasks by date and time

## 🔧 Available Scripts

```bash
npm run dev          # Start development server (port 9002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## 🤝 Contributing

This is a project by:
- **Hari Prasanth L**
- **Gowri Shankar M**
- **Kaaviya SN**
