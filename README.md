# 🚀 Portfolio Backend API

Backend API for my personal developer portfolio.

This backend provides API endpoints to manage and serve portfolio-related data such as **projects, skills, experience, certifications, and contact information**.

The API is connected to the frontend portfolio and is deployed on **Render** for production use.

---

## 🌐 Project Links

### Frontend Portfolio

🔗 https://javiths-portfolio.vercel.app

### Backend Repository

🔗 https://github.com/Javith148/portfolio_backend

### Backend Deployment

🚀 Deployed on **Render**

---

## 🛠️ Tech Stack

### Backend

* 🟢 Node.js
* 🚂 Express.js
* 🗄️ MySQL
* 🔌 REST API

### Development Tools

* Git
* GitHub
* VS Code
* Postman
* npm

### Deployment

* ☁️ Render
* 🌐 Vercel

---

## 📌 Features

* 🔌 RESTful API architecture
* 📂 Portfolio data management
* 👨‍💻 Project data API
* 💼 Experience data API
* 🛠️ Skills data API
* 📜 Certification data API
* 📬 Contact form API
* 🗄️ MySQL database integration
* 🔐 Environment variable configuration
* ☁️ Production deployment using Render
* 🌐 CORS support for frontend integration

---

## 📂 Project Structure

```text
portfolio_backend/
│
├── config/
│   └── database configuration
│
├── data/
│   └── portfolio data
│
├── routes/
│   └── API routes
│
├── schema.sql
│
├── server.js
│
├── package.json
├── package-lock.json
│
├── .env.example
├── .gitignore
└── README.md
```

##

---

## 🔌 API Architecture

The backend follows a REST API architecture where the frontend communicates with the backend using HTTP requests.

### Request Flow

```text
Portfolio Frontend
       │
       │ HTTP Request
       ▼
   Express.js
       │
       ▼
     Routes
       │
       ▼
   MySQL Database
       │
       ▼
    JSON Response
       │
       ▼
Portfolio Frontend
```

---

## 🌐 Frontend Integration

The backend API is integrated with the React portfolio frontend.

```text
React + Vite
     │
     │ REST API
     ▼
Node.js + Express
     │
     ▼
MySQL
```

The frontend fetches portfolio information dynamically from the backend instead of storing all data directly in the frontend.

---

## ☁️ Deployment

The backend is deployed on **Render**.

### Production Architecture

```text
                    ┌─────────────────────┐
                    │   React Portfolio   │
                    │       Vercel        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Node.js + Express │
                    │       Render        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MySQL Database   │
                    └─────────────────────┘
```

---

## 🧪 API Testing

The API can be tested using tools such as:

* Postman
* Browser
* Frontend application
* REST API clients

Example:

```text
GET /api/projects
```

The API returns data in JSON format.

---

## 🔒 Security

The project uses environment variables for sensitive configuration.

Sensitive information such as:

* Database username
* Database password
* Database host
* API credentials

should not be stored directly inside the source code.

The `.env` file is excluded from version control using `.gitignore`.

---

## 💡 What I Learned

While developing this backend, I gained practical experience in:

* Building REST APIs with Node.js
* Creating Express.js routes
* Connecting Node.js with MySQL
* Structuring backend projects
* Handling API requests and responses
* Environment variable management
* Frontend and backend integration
* API testing using Postman
* Deploying backend applications on Render
* Managing source code using Git and GitHub

---

## 🔗 Related Project

### Personal Portfolio

My portfolio frontend is built with React and Vite and communicates with this backend API.

🌐 **Live Portfolio:**
https://javiths-portfolio.vercel.app

💻 **Frontend Repository:**
https://github.com/Javith148/javiths_portfolio

---

## 👨‍💻 Author

### Javith S

Aspiring Full-Stack / Flutter Developer passionate about building responsive applications, REST APIs, and real-world software solutions.

### GitHub

https://github.com/Javith148

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐.

---

### 🚀 Built with Node.js, Express.js & MySQL
