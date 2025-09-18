# DebtMates
DebtMates helps you keep track of debts with friends and family, notifying users and helping settle payments easily.

# Tech Stack
- TypeScript
- React
- Tailwind CSS
- Supabase

# Features
- Create new debts and assign them to users
- Add authorized users to manage debts
- Notify users when a new debt is assigned
- Confirm or deny payments
- Clean and responsive UI using Tailwind CSS and Shadcn UI

# Getting started
1. `Clone the repository:`
```bash
git clone <repository link>
cd DebtMates

2. `Install dependencies:`
npm install

3. `Setup the environment variables:`
Create an .env file with your Supabase credentials:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. `Run the development server:`
npm run dev

5. `View the app:`
Open http://localhost:5173 in your browser.
```

# Project structure
- `/src/components` - Reusable UI components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Supabase and helper functions
- `/public` - Static assets (images, icons)
- `supabaseClient.ts` - Supabase client setup

# Future improvements
- Add WhatsApp or mobile push notifications for real-time alerts