# FoodShare - Location-Based Food Donation System

A comprehensive MERN stack application that connects food donors (restaurants, hotels, event organizers) with receivers (NGOs, charities, organizations) to reduce food waste in the hospitality industry.

## 🌟 Features

### For Donors
- **Easy Donation Posting**: Add food type, quantity, location, and expiry time
- **Real-time Tracking**: Monitor donation status from posted to completed
- **Location-based Matching**: Automatic matching with nearby receivers
- **Contact Integration**: Direct communication with accepting organizations
- **Donation History**: Track your impact and contribution over time

### For Receivers
- **Smart Notifications**: Email alerts for nearby donations matching your preferences
- **Preference Management**: Set food categories, beneficiary count, and service radius
- **Quick Acceptance**: One-click donation acceptance with contact details
- **Fair Distribution**: Algorithm ensures equitable distribution based on need and recency

### For Administrators
- **Dashboard Analytics**: Monitor platform usage and impact metrics
- **User Management**: Activate/deactivate accounts as needed
- **System Health**: Real-time monitoring of key platform components
- **Activity Tracking**: View recent platform activity and trends

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **React Hook Form** for form management
- **React Leaflet** for interactive maps
- **Axios** for API communication
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Geolib** for location calculations
- **Node-cron** for automated cleanup
- **Express Rate Limiting** for security

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account or SendGrid for email service

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm run install-all

# Or install individually:
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment Configuration

Create `server/.env` file based on `server/.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/foodshare
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=FoodShare <noreply@foodshare.com>
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup

For **MongoDB Atlas** (recommended for production):
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`
4. Whitelist your IP address

For **Local MongoDB**:
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Email Service Setup

**Option A: Gmail**
1. Enable 2-factor authentication on Gmail
2. Generate an app password
3. Use app password in `EMAIL_PASSWORD`

**Option B: SendGrid**
1. Create SendGrid account
2. Generate API key
3. Update `.env` with SendGrid configuration

### 5. Seed Sample Data

```bash
cd server
npm run seed
```

This creates demo accounts:
- **Admin**: admin@foodshare.com / admin123
- **Donor**: manager@goldengate.com / donor123  
- **Receiver**: coordinator@hope.org / receiver123

### 6. Start Development Servers

```bash
# Start both client and server
npm run dev

# Or start individually:
npm run client  # Frontend on http://localhost:3000
npm run server  # Backend on http://localhost:5000
```

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Donation Endpoints
- `POST /api/donations` - Create new donation
- `GET /api/donations/my-donations` - Get donor's donations
- `GET /api/donations/available` - Get available donations for receiver
- `GET /api/donations/accepted` - Get receiver's accepted donations
- `POST /api/donations/:id/accept` - Accept a donation
- `POST /api/donations/:id/complete` - Mark donation as completed

### Admin Endpoints
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/activity` - Get recent activity
- `GET /api/admin/users` - Get all users (paginated)
- `PATCH /api/admin/users/:id/toggle-status` - Activate/deactivate user

## 🔧 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Deploy

### Backend (Railway/Render)
1. Connect repository to Railway or Render
2. Set start command: `cd server && npm start`
3. Configure environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create production cluster
2. Configure network access
3. Update connection string in production environment

## 🏗️ Project Structure

```
food-donation-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── scripts/        # Utility scripts
│   └── .env                # Environment variables
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap for mapping services
- The open-source community for amazing tools and libraries
- All organizations working to reduce food waste

---

**Built with ❤️ to help reduce food waste and support communities in need.**