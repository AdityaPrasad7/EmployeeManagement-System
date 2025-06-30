## 📚 Project Functionality Overview

This project is a **Kods Employee Management System** with a full-stack architecture, featuring a Node.js/Express backend and a React frontend. It provides robust employee, leave, project, and task management for HR and employees.

---

### 🖥️ Frontend Functionality

The frontend is built with **React** and uses **Material-UI** for a modern, responsive UI. It communicates with the backend via RESTful APIs.

#### Key Features

- **Authentication**: Secure login for employees and HR, with protected routes.
- **Employee Dashboard**: Employees can view their profile, leave balances, request leave, and track leave history.
- **HR Dashboard**: HR can manage employees, approve/reject leave requests, assign projects, and monitor overall statistics.
- **Leave Management**:
  - Employees can submit leave requests (casual, sick, LOP).
  - View leave balances, pending requests, and monthly trends.
  - Track leave history with filtering by month/year.
- **Project & Task Management**:
  - HR can create projects and assign employees.
  - Employees can view assigned projects and tasks.
  - Task creation, assignment, and status tracking.
- **UI Components**:
  - Reusable components for tables, dialogs, charts, and forms.
  - Loading spinners and toast notifications for feedback.
- **Hooks & Services**:
  - Custom hooks for authentication and data fetching.
  - Service files for API communication (leave, project, task).

#### How to Use (Frontend)

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```
3. **Access the app**: Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 🗄️ Backend Functionality

The backend is built with **Node.js**, **Express**, and **MongoDB** (via Mongoose). It provides RESTful APIs for all core features.

#### Key Features

- **Authentication & Authorization**:
  - JWT-based login for employees and HR.
  - Middleware for route protection and role-based access.
- **Employee Management**:
  - CRUD operations for employee records.
  - HR can view, add, update, or remove employees.
- **Leave Management**:
  - Employees can submit leave requests.
  - HR can approve/reject requests.
  - Leave balances are tracked and updated per month.
  - Endpoints for fetching leave history, balances, and trends.
- **Project & Task Management**:
  - HR can create projects and assign employees.
  - Tasks can be created, assigned, and updated.
  - Employees can view their assigned projects and tasks.
- **Category Management**:
  - HR can manage employee categories (departments, roles).
- **Utilities & Middleware**:
  - Error handling, async wrappers, and custom response utilities.
  - Seeders for initial data population.

#### How to Use (Backend)

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```
2. **Set up environment variables**:
   - Create a `.env` file with your MongoDB URI, JWT secret, etc.
3. **Seed initial data (optional)**:
   ```bash
   node seeders/categorySeeder.js
   ```
4. **Start the server**:
   ```bash
   npm run dev
   ```
5. **API Endpoints**:
   - Auth: `/api/auth/login`, `/api/auth/register`
   - Employees: `/api/employees`
   - Leave: `/api/leave`
   - Projects: `/api/projects`
   - Tasks: `/api/tasks`
   - Categories: `/api/categories`

---

### 🔗 How Frontend & Backend Work Together

- The frontend makes HTTP requests to the backend API endpoints for all data operations.
- JWT tokens are used for authentication; tokens are stored in local storage and sent with each request.
- Leave requests, project assignments, and task updates are reflected in real-time via API calls and state updates.

---

### 📝 Example User Flows

#### Employee

1. **Login** → View dashboard → See leave balance → Submit leave request → Track leave status/history.
2. **View assigned projects/tasks** → Update task status.

#### HR

1. **Login** → Access HR dashboard → Manage employees/projects/tasks.
2. **Review leave requests** → Approve/reject → Balances and history update automatically.

---

### 🛠️ Project Structure

```
kods employee management/
  backend/
    controllers/      # Business logic for each resource
    middleware/       # Auth, error handling, etc.
    models/           # Mongoose schemas
    routes/           # API route definitions
    seeders/          # Scripts for initial data
    server.js         # Entry point
  frontend/
    src/
      components/     # Reusable UI components
      hooks/          # Custom React hooks
      pages/          # Page-level components
      services/       # API service files
      utils/          # Helper functions
```

---

### 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd kods\ employee\ management
   ```
2. **Set up backend and frontend as described above.**
3. **Enjoy managing employees, leaves, projects, and tasks!**

---

### 📖 Further Documentation

- For API details, see backend `routes/` and `controllers/`.
- For UI/UX, see frontend `src/components/` and `src/pages/`.
- For customization, refer to `theme.js` and service files.
