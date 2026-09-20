# UzWork Admin Panel 🛠️

A modern, responsive, and fully-featured Admin Panel for the UzWork platform. Built with React and Vite, this dashboard provides platform administrators with the tools they need to manage users, monitor activities, and handle platform operations efficiently.

## 🚀 Technologies Used

- **Frontend Framework:** React 19 + Vite
- **Styling & UI:** Chakra UI, TailwindCSS, Framer Motion
- **State Management & Data Fetching:** TanStack React Query
- **Tables & Data Grids:** TanStack React Table
- **Charts & Analytics:** Recharts
- **Real-time Communication:** Socket.io-client
- **Routing:** React Router DOM

## 🌟 Key Features

- **Secure Authentication:** JWT-based login system for administrators.
- **Real-time Dashboard:** Monitor key metrics and live platform activities using Socket.io and Recharts.
- **User Management:** View, verify, and manage freelancers and clients on the platform.
- **Dynamic Data Tables:** Advanced tables with sorting, filtering, and pagination using React Table.
- **Modern UI/UX:** Clean and accessible design built with Chakra UI and TailwindCSS.

## ⚙️ Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Running instance of the [UzWork Backend](https://github.com/Ogabek-Mannonov/uzwork-backend)

### 1. Clone the repository
```bash
git clone https://github.com/Ogabek-Mannonov/uzwork-admin-panel.git
cd uzwork-admin-panel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following configuration:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```
*(Make sure the ports match your local backend server).*

### 4. Start the development server
```bash
npm run dev
```
The application will start on `http://localhost:5174`.

## 🔐 Creating an Admin User
To log in, you need an admin account. If you don't have one, you can create it directly in the PostgreSQL database of your backend:

```sql
INSERT INTO users (id, username, first_name, last_name, email, password_hash, role, kyc_status, status, is_verified, created_at, updated_at) 
VALUES (
    gen_random_uuid(), 
    'superadmin',
    'Super',
    'Admin',
    'super@uzwork.uz', 
    '$2b$10$AgihuShTDGr8ORpFs1btSOJd22LaGeO9Rkb/gKoJARjdvGGnheTOO', -- hash for 'admin123'
    'admin', 
    'unverified', 
    'active',
    true,
    NOW(), 
    NOW()
);
```
**Login credentials:**
- Email: `super@uzwork.uz`
- Password: `admin123`

---
*Designed and built for portfolio demonstration.*
