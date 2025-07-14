# Sykell Web Crawler Dashboard

A modern, full-stack web crawler dashboard built with React (Vite, Tailwind CSS, shadcn/ui) and Go (Gin, GORM, MySQL). Easily manage, crawl, and analyze URLs with a beautiful, responsive UI and robust backend APIs.

---

## Features

- **Add, manage, and delete URLs**
- **Run crawler** on-demand for any URL
- **View crawl results**: HTML version, heading structure, link stats, broken links, login form detection
- **Dashboard analytics**: sortable, paginated, filterable tables
- **Detail view**: charts for headings and link distribution, broken link list
- **Bulk actions** (delete, rerun) in URL Manager
- **Responsive UI**: mobile-first, works on all devices
- **Backend APIs**: RESTful, clean, and extendable

---

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts
- **Backend**: Go, Gin, GORM, MySQL
- **Database**: MySQL 
---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Go (v1.20+ recommended)
- MySQL (local or Docker)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sykell_task
```

### 2. Backend Setup

#### a. Configure Environment
Create a `.env` file in `backend/`:
```env
DB_URL=root:password@tcp(localhost:3306)/url_crawler?charset=utf8mb4&parseTime=True&loc=Local
PORT=3000
```
Adjust `DB_URL` as needed for your MySQL setup.

#### b. Run Database Migrations
```bash
cd backend
go run cmd/migrate/main.go
```

#### c. Start the Backend Server
```bash
go run cmd/server/main.go
```
The backend will run on [http://localhost:3000](http://localhost:3000)

### 3. Frontend Setup

#### a. Install Dependencies
```bash
cd ../frontend
npm install
```

#### b. Start the Frontend Dev Server
```bash
npm run dev
```
The frontend will run on [http://localhost:5173](http://localhost:5173)

---

## Usage

- **Dashboard**: View all crawl results, filter/sort/paginate, open details
- **URL Manager**: Add new URLs, run crawler, delete URLs, bulk actions
- **Detail View**: See charts, broken links, and crawl metadata
- **Mobile**: All features work on mobile devices

---

## API Endpoints

### Main Endpoints
- `POST   /urls`         - Add URL to database
- `POST   /urls/crawl`   - Run crawler for a URL
- `GET    /urls`         - Get all URLs and crawl results
- `DELETE /urls/:id`     - Delete a single URL and its data
- `DELETE /urls`         - Delete multiple URLs (bulk)



---

## Project Structure

```
sykell_task/
├── backend/
│   ├── cmd/
│   │   ├── migrate/
│   │   └── server/
│   ├── internal/
│   │   ├── api/
│   │   ├── crawler/
│   │   ├── db/
│   │   └── server/
│   ├── models/
│   └── go.mod, go.sum
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   ├── App.tsx
│   │   └── ...
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Customization & Extending
- **Add new analysis**: Extend the Go crawler and models, update API and frontend types
- **Add new UI features**: Use shadcn/ui and Tailwind for rapid UI development
- **API integration**: All frontend API calls are in `frontend/src/services/api.ts`

---

## Troubleshooting
- **Port conflicts**: Change `PORT` in `.env` or Vite config
- **MySQL errors**: Check your DB credentials and that MySQL is running
- **CORS issues**: The backend allows requests from `localhost:5173` by default
- **Dev script missing**: Ensure you run `npm run dev` from the `frontend/` directory

