# 💸 Quick-Split – Bill Splitting Made Simple

Quick-Split is a modern full-stack bill-splitting application that helps friends, roommates, or colleagues manage shared expenses effortlessly. Whether it's for a dinner, trip, or household, Quick-Split ensures everyone pays their fair share – with style and simplicity.

---

## 🚀 Features

- 🔐 **JWT Authentication**
- 👥 **Group Management** (Create, edit, delete, view members)
- ➕ **Add Expenses** (Split equally among group members)
- 📊 **Expense Overview** (Who paid what, who owes whom)
- 💸 **Stripe Payment Integration** (Settle up securely)
- 🧾 **Transaction History** (All payment records)
- 📈 **Dashboard & Reports**
- 📱 **Responsive UI**

---

## 🛠️ Tech Stack

### 🌐 Frontend
- React.js
- React Router
- Context API
- Axios
- FontAwesome / Lucide Icons
- CSS

### 🖥️ Backend
- Spring Boot (Java)
- Spring Security
- JWT
- Stripe SDK

### 🗃️ Database
- MongoDB (Cloud with MongoDB Atlas)

---

## 📁 Project Structure

📁 quick-split/  ├── backend/ 
                  │ └── src/main/java/com/billsplitter/... 
                  ├── frontend/   ├── src/components/ 
                                  ├── src/pages/  
                                  ├── src/context/ 
                  │ └── App.js 
                  ├── README.md


---

## ⚙️ Setup Instructions

### 🧪 Backend Setup (Spring Boot)

```bash
git clone https://github.com/your-username/quick-split.git
cd quick-split/backend

Update application.properties:

spring.data.mongodb.uri=your-mongodb-uri
jwt.secret=your-jwt-secret
stripe.api.key=your-stripe-key


Run the backend:

./mvnw spring-boot:run


## 🚀 Features
