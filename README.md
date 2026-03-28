# EasyMeet: Open-Source Calendly Alternative built with Next.js

> [!WARNING]
> **Google Cloud Testing Mode Disclaimer**: This project is currently configured in "Testing" mode in the Google Cloud Console. 
> - Users will see a **"Google hasn't verified this app"** warning during sign-in. You can safely bypass this by clicking "Advanced" and "Go to [app name] (unsafe)".
> - Only **authorized test users** added in the Google Cloud Console can sign in. Ensure your email is added to the "Test users" list in your OAuth consent screen settings.

EasyMeet is a modern, high-performance scheduling and booking system designed to simplify appointment management. Built with the latest Next.js 15 features, it offers a seamless experience for both hosts and visitors, with a focus on speed, responsiveness, and a unique neobrutalist aesthetic.

---

## 📸 Screenshots

<div align="center">
  <h3>Desktop View</h3>
  <img src="./github/screenshots/desktop-login-scree.png" alt="EasyMeet Desktop Login" width="800">
  <br><br>
  <h3>Admin Dashboard</h3>
  <img src="./github/screenshots/admin-view.png" alt="EasyMeet Admin Dashboard" width="800">
  <br><br>
  <h3>Public Booking Page</h3>
  <img src="./github/screenshots/booking-consultation.png" alt="EasyMeet Booking Page" width="800">
</div>

---

## 🚀 Key Features

-   **⚡ High Performance**: Optimized with Next.js App Router for lightning-fast page transitions.
-   **🔐 Secure Authentication**: Integrated with Google Auth via Next-Auth for a smooth user experience.
-   **📅 Smart Scheduling**: Intuitive calendar interface to manage availability and handle time-zone-aware bookings.
-   **🎨 Unique UI/UX**: Bold neobrutalist design that stands out from typical SaaS interfaces.
-   **📱 Fully Responsive**: Seamless experience across mobile, tablet, and desktop devices.
-   **🛠️ Admin Dashboard**: Centralized management of availability, duration, and upcoming bookings.
-   **✉️ Email Notifications**: Automated confirmations and notifications to keep everyone in the loop.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router & Server Actions)
-   **Database**: [PostgreSQL (Neon)](https://neon.tech/) with [Prisma ORM](https://www.prisma.io/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Deployment**: [Vercel](https://vercel.com/)
-   **Icons/Images**: Custom SVG icons and Next.js Image optimization

---

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/easy-meet-booking-system.git
cd easy-meet-booking-system
pnpm install
```

### 2. Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```
*(Fill in your database URL, authentication secrets, and key environment variables)*

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to see your app in action!

---

## 📄 License

This project is licensed under the MIT License.
