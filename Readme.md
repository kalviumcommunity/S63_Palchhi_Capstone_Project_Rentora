# S63_Capstone_Project_Rentora
This is your first repository

🏡 Rentora
Rentora is a modern platform built to simplify the process of buying, selling, and renting properties — with a strong focus on authenticity, trust, and user experience.

## Project Motive
The real estate landscape is filled with misleading listings, fake accounts, and unreliable communication. Rentora aims to solve these issues by:
--> Providing a secure and verified platform to list and explore properties.
--> Reducing the spread of fake or scam property listings using robust authentication and verification features.
--> Offering a seamless experience for both property seekers and listers with well-designed UI and intuitive workflows.

 ## Key Features

 1. Verified Listings – Only authenticated users can post properties.
 2. Buy, Sell, and Rent – A unified portal for all types of real estate needs.
 3. Filtered Search – Easily browse listings based on location, price, type, and more.
 4. Listing Management – Edit, delete, or relist your property with ease.
 5. Responsive Design – Works beautifully across desktop and mobile.

## Design
--> Low-Fidelity Wireframes: Helped us shape the initial structure and flow.
--> High-Fidelity Prototypes: Polished designs that reflect the final UI/UX vision.

## Tech Stack (planned or used)
--> Frontend: React / Next.js / TailwindCSS
--> Backend: Node.js / Express
--> Database: MongoDB & MySQL (dual storage for flexibility and performance)
--> Authentication: JWT / OAuth (Google Login, etc.)
--> Deployment: Vercel / Render / Railway / Netlify (TBD)

🗓 1-Month Plan to Complete Rentora

🧱 Week 1 – Backend Foundation (Days 1–7)

Day 1: Setup Node.js project, folder structure, MongoDB connection.
Day 2: Install dependencies (express, mongoose, dotenv, etc.).
Day 3: Create User model and implement Signup API.
Day 4: Implement Login API with JWT auth and bcrypt.
Day 5: Add auth middleware and protect routes.
Day 6: Create Listing model and basic Create/Get endpoints.
Day 7: Add Update/Delete routes with ownership checks.

🧰 Week 2 – Backend Expansion + Testing (Days 8–14)

Day 8: Implement filters: rent/sale, location, price range.
Day 9: Add “get listings by user” API endpoint.
Day 10: Seed the database with sample users and listings.
Day 11: Write reusable error handling and response utilities.
Day 12: Test all APIs with Postman or Thunder Client.
Day 13: Refactor backend folder structure and add comments.
Day 14: Write a README and .env.example file for the backend.

🎨 Week 3 – Frontend Setup & Core Pages (Days 15–21)

Day 15: Set up React project with Tailwind CSS and React Router.
Day 16: Create Login & Signup pages, connect to backend.
Day 17: Store JWT, setup auth context and protected routes.
Day 18: Build homepage to display all listings.
Day 19: Add filters (location, rent/sale, price) to homepage.
Day 20: Build create/edit listing forms with image upload (mock/Cloudinary).
Day 21: Implement listing detail page with delete button.

🚀 Week 4 – User Profiles, Polish, & Deployment (Days 22–28)

Day 22: Create user dropdown and display listings by user.
Day 23: Add profile page to view user-specific data.
Day 24: Add loading states, toasts, and basic error messages.
Day 25: Make the site responsive and mobile-friendly.
Day 26: Finalize styling and UI polish across all pages.
Day 27: Deploy backend (e.g., Railway, Render) and frontend (Vercel/Netlify).
Day 28: Final testing, bug fixes, README update, and project submission.

##  Feature Upgrade

Add wishlist/favorite listings
Image upload via Cloudinary
Basic chat between buyer and seller
Reviews & ratings for listings
Filtering improvements (e.g. furnished, pet-friendly)

📱 User Experience
Responsive mobile-friendly UI
Loading states, toasts, error handling
User profile with their listings
In-app notifications (new messages, updates)

💰 Monetization (Early-Stage)
Paid listing boosts (highlight/feature)
Basic subscription for landlords or agents
Ads for home services (movers, cleaners, etc.)

🌐 Tech Improvements
Backend testing and cleanup
Host backend (Render/Railway) + frontend (Vercel/Netlify)
Add admin dashboard (basic controls)
Prepare for mobile app (React Native-ready structure)

## Backend deployment link ##
https://s63-palchhi-capstone-project-rentora-1.onrender.com

## Frontend deployment link ##
https://stellar-cobbler-864deb.netlify.app/

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
