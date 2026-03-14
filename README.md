# Helios Prime

AI-powered fitness companion — calorie tracking, workout planning, body analysis, fasting, and more.

## Features

- **Dashboard** — Daily calorie ring, macros breakdown, water tracker, energy level logging
- **Food Diary** — Log meals across 4 categories (breakfast, lunch, dinner, snacks) with manual entry, AI food photo scanning, barcode lookup, and custom recipes
- **AI Food Scanner** — Take a photo of your meal and get instant calorie/macro estimates (Cohere vision AI)
- **Barcode Scanner** — Scan product barcodes to auto-fill nutrition data (Open Food Facts API)
- **Recipe Builder** — Create and save custom recipes with per-serving macro calculations
- **Workout Planner** — Build custom workout plans with 60+ exercises, track active sessions with set/rep logging
- **AI Workout Generator** — Generate personalized workout plans based on your goals and equipment
- **Progress Tracking** — Weight log with trend charts, body measurements, nutrition trend analysis
- **AI Health Score** — Weekly health score based on your nutrition adherence, workouts, and habits
- **AI Body Analysis** — Upload a photo for AI-powered physique assessment with muscle balance and recommendations
- **Fasting Tracker** — Intermittent fasting timer with presets (16:8, 18:6, 20:4, OMAD), fasting zones, streaks, and history
- **Community Feed** — Share achievements, view posts from other users, like and interact
- **Coaching Directory** — Browse certified fitness coaches and nutritionists filtered by specialty

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 with CSS variables
- **State Management**: Zustand with localStorage persistence
- **AI**: Cohere SDK (CohereClientV2) — text + vision models with mock fallback
- **Barcode**: Open Food Facts API
- **Icons**: Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (optional)

Create a `.env.local` file to enable AI features:

```
COHERE_API_KEY=your_cohere_api_key
```

Without an API key, the app uses mock data for all AI features.

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing page
│   ├── (auth)/          # Login & Register
│   ├── (app)/           # Authenticated app pages
│   │   ├── dashboard/
│   │   ├── food-log/
│   │   ├── workouts/
│   │   ├── fasting/
│   │   ├── progress/
│   │   ├── community/
│   │   ├── coaches/
│   │   ├── settings/
│   │   └── onboarding/
│   └── api/ai/          # AI API routes (scan-food, generate-workout, health-score, body-analysis)
├── components/          # Feature components (food, workout, progress, onboarding)
├── stores/              # Zustand stores (auth, food, recipe, workout, progress, fasting)
└── lib/                 # Utilities, exercise library
```
