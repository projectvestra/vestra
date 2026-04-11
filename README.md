# 👗 Vestra - AI-Powered Smart Outfit Planning & Personalized Styling App

A cutting-edge mobile application that helps users plan outfits intelligently using ML-powered recommendations, AI styling suggestions, and personal preference tracking. Built with React Native and powered by anthropic AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Polish-green)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-brightgreen)

---

## 📱 Features

### Authentication & User Management
- **Email/Username Login**: Login with email or unique username (existing users)
- **Google Sign-In**: One-click authentication with Google
- **Session Persistence**: Stay logged in when closing and reopening the app
- **Unique Usernames**: Set custom usernames separate from display names (3+ characters)
- **Profile Management**: Complete user profile with preferences and styles
- **Secure Credentials**: Firebase Authentication with encrypted storage

### Core Features

#### 1. **AI-Powered Outfit Recommendations** 🤖
- ML-based outfit suggestions using Claude AI
- Context-aware recommendations (occasion, temperature, personal style)
- Outfit scoring (color harmony, coherence, occasion match)
- Lock items to components (e.g., lock shoes and find matching tops/bottoms)
- Real-time styling suggestions

#### 2. **Weekly Outfit Planner** 📅
- Plan outfits for each day of the week
- AI-generated weekly plans based on occasions
- Visual preview of planned outfits
- Smart outfit rotation to avoid repetition
- Occasion-specific recommendations

#### 3. **Digital Wardrobe Management** 👔
- Upload and organize wardrobe items with photos
- Categorize items (shirts, pants, shoes, jackets, accessories, etc.)
- Add item colors, brands, and metadata
- Cloud sync with Firestore
- Search and filter wardrobe
- Wardrobe statistics and insights

#### 4. **AI Style Assistant** ✨
- Get personalized styling advice
- Color coordination recommendations
- Style pairing suggestions
- Body type and height considerations
- Constraint-based recommendations (dress codes, religious preferences)

#### 5. **Explore Feed** 🌍
- Discover trending outfits and styles
- Browse outfit ideas from the community
- Get inspiration for your wardrobe
- Save favorite styles

#### 6. **Shopping Integration** 🛍️
- Browse marketplace for recommended items
- Find similar items from online stores
- Save products to wishlist
- Rotating curated catalog for better discovery
- Direct product links

#### 7. **Settings & Account Security** 🔐
- Dedicated settings screen
- Change password flow
- Notification preference toggle
- Dark mode preference toggle

#### 8. **Search & Discovery** 🔍
- Search wardrobe items
- Filter by category, color, brand
- Search marketplace products
- Advanced filtering options

#### 9. **Multi-Step Onboarding** 🚀
- **Step 1**: Basic details (name, age, gender)
- **Step 2**: Style preferences (casual, formal, sporty, etc.)
- **Step 3**: Color preferences and skin tone
- **Step 4**: Clothing constraints (budget, dress codes, religious preferences)

#### 10. **Dark Mode** 🌙
- Full dark mode support
- Automatic theme switching
- User-configurable theme preferences
- Persistent theme settings

#### 11. **User Preferences** ⚙️
- Notification settings
- Theme preferences
- Display name and username
- Profile information
- Style history

#### 12. **Production Polish** ✨
- Calibrated soft contrast color system
- Reduced visual clutter and heavy container styling
- Improved tactile press feedback across primary interactions
- FlatList rendering optimizations for smoother perception

---

## 🛠️ Tech Stack

### Frontend
- **React Native 0.81.5** - Cross-platform mobile development
- **Expo 54.0.32** - Development framework and build service
- **Expo Router 6.0.22** - File-based routing (like Next.js)
- **TypeScript 5.9.2** - Type-safe development
- **React 19.1.0** - UI library

### Backend & Database
- **Firebase 12.11.0** - Real-time database and authentication
  - Firestore for data storage
  - Firebase Auth for user management
  - Cloud Storage for images
- **FastAPI** (Python) - AI backend for recommendations
- **Anthropic Claude Sonnet 4.6** - AI model for outfit recommendations

### State Management & Storage
- **React Context API** - Theme and global state
- **AsyncStorage 2.2.0** - Local device storage (persists session)
- **Firestore** - Cloud data storage

### UI & Navigation
- **React Navigation 7.1.8** - Navigation primitives
- **Expo Vector Icons 15.0.3** - Icon library
- **Safe Area Context 5.6.0** - Safe area handling
- **Reanimated 4.1.1** - Smooth animations
- **Expo Linear Gradient 55.0.13** - Layered surface treatments
- **Expo Notifications 55.0.18** - Notification permission and delivery support

### Authentication
- **@firebase/auth 1.12.1** - Firebase authentication
- **@react-native-google-signin/google-signin 16.1.2** - Google Sign-In

### Image Handling
- **Expo Image 3.0.11** - Optimized image component
- **Expo Image Picker 17.0.10** - Camera/gallery access
- **React Native Image colors 2.6.0** - Extract colors from images

### Development Tools
- **ESLint 9.25.0** - Code linting
- **Expo CLI** - Development and deployment tools

---

## 📋 System Requirements

### For Development
- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **Expo CLI**: Latest version
- **Android Studio** (for Android development) or **Xcode** (for iOS development)
- **Git**: For version control

### For Running
- **Android Device/Emulator**: Android 8.0+ (API 26+)
- **iOS Device/Simulator**: iOS 14+
- **Minimum RAM**: 2GB
- **Internet Connection**: Required (for Firebase, Google Auth)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/projectvestra/vestra.git
cd vestra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Authentication
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id

# AI Backend
EXPO_PUBLIC_RECOMMENDATION_API_URL=https://your-ai-backend-domain

# Marketplace API
EXPO_PUBLIC_MARKETPLACE_API_URL=https://your-domain.com/api/marketplace/products

# Optional local admin gating for private dev tools
EXPO_PUBLIC_NOTIFICATION_ADMIN_UID=your_firebase_uid
EXPO_PUBLIC_NOTIFICATION_ADMIN_EMAIL=your_email@example.com
```

Marketplace endpoint response example:

```json
{
  "products": [
    {
      "id": "sku_123",
      "name": "Men Navy Slim Fit Shirt",
      "brand": "Roadster",
      "category": "Shirts",
      "price": 1299,
      "currency": "INR",
      "imageUrl": "https://cdn.example.com/images/sku_123.jpg",
      "productUrl": "https://www.myntra.com/shirt/sku_123",
      "description": "100% cotton shirt"
    }
  ]
}
```

Notes:
- You can return either a raw array or an object with a products array.
- Product URL fields supported are affiliateUrl, url, link, productUrl, links.product, links.affiliate, and product.url.
- The app reads the endpoint from app extra marketplace apiUrl first, then EXPO_PUBLIC_MARKETPLACE_API_URL.

Recommendation API notes:
- The app reads recommendation endpoint from app extra recommendation apiUrl first, then EXPO_PUBLIC_RECOMMENDATION_API_URL.
- If backend is unavailable, the app falls back to local recommendation logic.

### 4. Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Firebase Authentication (Email, Google)
5. Download `google-services.json` and place it in `android/app/`
6. Add your configuration to `app.json`

### 5. Set Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add Android and Web client IDs
4. Update `.env` file with your credentials

### 6. Set Up Anthropic API
1. Sign up at [Anthropic](https://console.anthropic.com/)
2. Deploy your recommendation backend and expose a base URL
3. Add URL to `.env` as `EXPO_PUBLIC_RECOMMENDATION_API_URL`

---

## 📲 Running the App

### Option 1: Development Server (Easiest)
```bash
npm start
```
Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser

### Option 2: Android
```bash
npm run android
```
or
```bash
expo run:android
```

### Option 3: iOS (Mac only)
```bash
npm run ios
```
or
```bash
expo run:ios
```

### Option 4: Web
```bash
npm run web
```

### Option 5: EAS Build (Production builds)
```bash
eas build --platform android
```

---

## 📁 Project Structure

```
vestra/
├── app/                           # Main app screens (Expo Router)
│   ├── auth/                      # Authentication screens
│   │   ├── login.tsx             # Email/Username login
│   │   └── signup.tsx            # Registration
│   ├── tabs/                      # Main app tabs
│   │   ├── home.tsx              # Home & today's outfit
│   │   ├── planner.js            # Weekly planner
│   │   ├── wardrobe.js           # Wardrobe management
│   │   ├── explore.js            # Explore feed
│   │   ├── search.tsx            # Search products
│   │   └── profile.tsx           # User profile
│   ├── onboarding/                # Multi-step onboarding
│   │   ├── step1.tsx             # Basic details
│   │   ├── step2.tsx             # Style preferences
│   │   ├── step3.tsx             # Colors
│   │   └── step4.tsx             # Constraints
│   ├── settings.tsx              # Settings and account controls
│   ├── marketplace-wishlist.tsx  # Saved marketplace products
│   └── _layout.tsx               # App layout
│
├── src/
│   ├── services/                  # Backend services
│   │   ├── authService.js        # Auth (login, signup, username)
│   │   ├── firebaseConfig.ts     # Firebase setup
│   │   ├── usernameService.js    # Username management
│   │   ├── userService.js        # User profile
│   │   ├── recommendationService.js # AI recommendations
│   │   ├── notificationPermissionService.ts # Push permission handling
│   │   ├── cloudWardrobeService.js  # Wardrobe cloud sync
│   │   ├── outfitService.js      # Outfit logic
│   │   ├── homeService.js        # Home screen data
│   │   ├── exploreService.js     # Explore feed
│   │   ├── marketplaceService.js # Shopping
│   │   ├── searchService.js      # Search
│   │   └── userPreferencesService.js # User preferences
│   │
│   ├── components/                # Reusable components
│   │   ├── UsernameModal.js      # Username selector
│   │   ├── WardrobeItemCard.js   # Wardrobe item display
│   │   ├── ProfileStatCard.js    # Stats display
│   │   └── home/
│   │       ├── StyleAssistantModal.js # AI style advice
│   │       ├── TodayOutfitCard.js     # Today's outfit
│   │       └── WeeklyPreview.js       # Weekly preview
│   │
│   ├── context/                   # React Context
│   │   ├── ThemeContext.js        # Dark/light mode
│   │   └── OnboardingContext.js   # Onboarding state
│   ├── theme/
│   │   └── ui.js                  # Shared spacing, depth, motion tokens
│   └── components/
│       └── home/                  # Core home widgets and assistant UI
│
├── outfit-ai-backend/             # FastAPI backend
│   ├── main.py                   # ML models & recommendations
│   └── requirements.txt
│
├── constants/
│   └── theme.ts                   # Colors & styling
│
├── assets/
│   └── images/                    # App icons & images
│
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── .env                          # Environment variables (create this)
└── README.md                      # This file
```

---

## 🔐 Firebase Setup Instructions

### 1. Create Firebase Project
```
1. Go to firebase.google.com
2. Click "Add project"
3. Enter project name: "vestra"
4. Enable Google Analytics (optional)
5. Click Create Project
```

### 2. Set Up Firestore Database
```
1. In Firebase Console, go to Firestore
2. Click "Create Database"
3. Select "Start in production mode"
4. Choose location (closest to you)
5. Click Enable
```

### 3. Enable Authentication
```
1. Go to Authentication
2. Click "Get started"
3. Enable Email/Password
4. Enable Google
5. Add your OAuth credentials
```

### 4. Set Security Rules
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /user_profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Public data that anyone can read
    match /usernames/{doc=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Wardrobe items
    match /wardrobe/{userId}/items/{itemId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 5. Get Configuration
```
1. Go to Project Settings (gear icon)
2. Under General tab, scroll to "Your apps"
3. Select "Android" or "Web"
4. Copy configuration
5. Add to app.json and .env
```

---

## 🤖 AI Backend Setup (Optional for Full Features)

### Install Python Dependencies
```bash
cd outfit-ai-backend
pip install -r requirements.txt
```

### Run Backend Locally
```bash
python -m uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

Fallback behavior:
- If remote AI is unavailable, the backend and app return local fallback recommendations instead of failing requests.

### API Endpoints
- `GET /health` - Health check
- `POST /recommend` - Get outfit recommendations
- `POST /weekly-plan` - Get weekly outfit plan

---

## 🔑 Key Features Explained

### Authentication Flow
1. **New User**: 
   - Sign up with email → Complete onboarding → Set username (optional)
   
2. **Existing User**: 
   - Login with email OR username + password → Access app

3. **Session Persistence**: 
   - Session stored in AsyncStorage → Won't log out on app close

### Recommendation Engine
1. User selects occassion and temperature
2. AI analyzes wardrobe items
3. Claude AI generates 10 outfit combinations
4. Outfits ranked by style score (color, coherence, occasion)
5. User can lock items to refine recommendations

### Weekly Planning
1. User selects occasions for each day
2. AI generates weekly outfit plan
3. Avoids outfit repetition
4. Considers weather and preferences
5. User can save or modify plan

### Theme Persistence
1. User selects dark/light mode
2. Theme state saved to Firestore
3. On app restart, previous theme loads
4. Context API provides theme across app

---

## 🚢 Deployment

### Android (EAS Build)
```bash
eas build --platform android --release
eas submit --platform android
```

### iOS (EAS Build)
```bash
eas build --platform ios --release
eas submit --platform ios
```

### Web
```bash
npm run build
```
Deploy to Netlify, Vercel, or any static host.

---

## 📊 Database Schema

### user_profiles
```
{
  uid: string,
  displayName: string,
  email: string,
  username: string (unique),
  height: string,
  bodyType: string,
  preferredStyles: array,
  preferredColors: array,
  constraints: array,
  darkMode: boolean,
  notifications: boolean,
  authProvider: string,
  profileSetupComplete: boolean,
  createdAt: timestamp
}
```

### wardrobe/{userId}/items
```
{
  id: string,
  category: string,
  color: string,
  colorName: string,
  brand: string,
  size: string,
  imageUrl: string,
  type: string,
  tags: array,
  createdAt: timestamp
}
```

### usernames
```
{
  username: string (unique),
  userId: string,
  claimedAt: timestamp
}
```

### notifications
```
{
  title: string,
  body: string,
  toAll: boolean,
  audience: string,
  includeSender: boolean,
  requiresPushPermission: boolean,
  sentByUid: string,
  sentByEmail: string,
  createdAt: timestamp,
  read: boolean
}
```

---

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear Expo cache
expo start --clear

# Or reset project
npm run reset-project
```

### Firebase Connection Issues
- Check internet connection
- Verify Firebase credentials in .env
- Ensure security rules allow operations
- Check Firebase console for errors

### Google Sign-In Not Working
- Verify OAuth credentials are correct
- Check webClientId configuration
- Ensure app is signed with correct keystore
- Verify SHA1 fingerprint in Firebase

### Username Not Saving
- Check Firestore is enabled
- Verify security rules allow writes
- Check user is authenticated
- Look for error messages in console

### AI Recommendations Not Working
- Verify recommendation backend URL is reachable
- Check backend service logs for AI provider errors
- Confirm app fallback mode is active when backend is down

### Notifications Not Appearing
- Confirm user granted notification permission
- Check user notification preference toggle in settings
- Validate notification payload uses opted-in broadcast audience

---

## 📚 API Reference

### Authentication
```javascript
// Login with email
const result = await loginWithEmail(email, password);

// Login with username
const result = await loginWithUsername(username, password);

// Register
const result = await registerWithEmail(name, email, password);

// Logout
await logout();
```

### Usernames
```javascript
// Check if username is available
const available = await isUsernameUnique(username);

// Set/update username
await claimUsername(userId, newUsername, oldUsername);
```

### Recommendations
```javascript
// Get AI outfit recommendations
const outfits = await getOutfitRecommendations({
  wardrobe: wardrobeItems,
  occasion: "casual",
  temperature: 22,
  lockedItems: { top: null, bottom: null, shoes: null }
});
```

### Wardrobe
```javascript
// Get user's wardrobe
const items = await getUserWardrobeItems();

// Add wardrobe item
await addWardrobeItem(item);

// Delete wardrobe item
await deleteWardrobeItem(itemId);
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Code Style
- Use ESLint: `npm run lint`
- Use TypeScript for type safety
- Follow React best practices
- Write descriptive commit messages

---

## 📄 License

This project is private and maintained by the Vestra team.

---

## 👥 Team & Attribution

**Development Team:**
- Frontend: React Native/Expo development
- Backend: AI recommendations with Claude
- DevOps: EAS Build, Firebase, deployment

**Technologies:**
- React Native & Expo
- Firebase
- Anthropic Claude AI
- FastAPI

---

## 📞 Support & Feedback

For bugs and feature requests, please create an issue in the repository.

For questions or feedback, reach out to the development team.

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Social sharing of outfits
- [ ] Community styling tips
- [ ] AR virtual try-on
- [ ] Weather-based automatic recommendations
- [ ] Outfit history and analytics
- [ ] Laundry reminder system
- [ ] Integration with fashion retailers
- [ ] Offline mode

### Performance Improvements
- [ ] Image optimization and caching
- [ ] Lazy loading
- [ ] Offline support
- [ ] API response caching

---

## 📝 Version History

### v1.0.1 (Current)
- ✅ User authentication (email/username)
- ✅ Multi-step onboarding
- ✅ AI outfit recommendations
- ✅ Weekly planner
- ✅ Digital wardrobe
- ✅ Style assistant
- ✅ Dark mode
- ✅ Session persistence
- ✅ Shopping integration
- ✅ Explore feed
- ✅ Marketplace wishlist and rotating catalog
- ✅ Settings screen with password change
- ✅ One-time notification permission flow
- ✅ Backend fallback recommendation behavior
- ✅ Production polish pass (minimalism, smoothness, list rendering)

---

**Built with ❤️ for fashion lovers and tech enthusiasts**

Last Updated: April 11, 2026
