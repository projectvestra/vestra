# Vestra — Smart Outfit Planning & Styling App

Vestra is a university-level mobile application that acts as a personal digital stylist, helping users generate outfit combinations and reduce daily decision fatigue.

---

## Project Overview

Choosing outfits daily can be time-consuming and mentally exhausting. Vestra simplifies this by generating complete outfit combinations using clothing categories such as shirts, pants, shoes, and accessories.

The goal is to provide a fast, intuitive, and automated styling experience for users who want to look good without overthinking.

---

## Tech Stack

### Frontend
- React Native (Expo)
- JavaScript

### Backend & Services (Planned/Partial)
- Python (Machine Learning algorithms)
- Firebase (Database + Authentication)
- Cloudinary (Image transformation and optimization)

---

## Core Features

### Wardrobe Management
- Add custom clothing items (shirts, pants, shoes, hoodies, jackets, sunglasses, accessories)
- Winter mode enables seasonal items
- Edit and update wardrobe items after adding
- Organize and filter wardrobe
- Size and fit customization
- Support for UK/US/EU shoe sizes
- Option to shop items directly

---

### Profile System
- Unique username support
- Edit name, email, username
- Store user preferences (height, colors, etc.)
- Dark mode toggle
- Notification settings (enable/disable)
- Logout functionality

---

### Outfit Generation
- Daily outfit generation using ML-based compatibility scoring
  - Color matching
  - Occasion suitability
  - Overall cohesion
- Save, favorite, or discard generated outfits
- Separate sections:
  - Saved
  - Favorites
  - Discarded

#### Interaction Features
- Swipe system:
  - Left → discard
  - Right → save
  - Up → favorite
- Mix-and-match:
  - Lock specific items (e.g., pants) and generate remaining outfit
- Style-based generation (casual, formal, etc.)
- Winter mode toggle
- Option to shop generated outfits

---

### Weekly Planner
- ML-based weekly outfit generation (Python)
- Local fallback scoring system
- Assign styles per day (e.g., casual Monday, formal Tuesday)
- Lock specific items for a day
- Regenerate outfit for individual days
- Full weekly plan generation

---

### Explore
- View trending fashion content and updates

---

### Search
- Search and discover outfits to purchase online

---

## Architecture Overview

- Component-based structure for modularity
- Separation of UI and logic
- Local asset handling for performance
- Scalable design for ML and backend integration

---

## Current Status

- Frontend actively in development
- Uses mock data for outfit generation
- Backend and ML integration in progress

---

## Future Enhancements

- Advanced personalization using ML
- Weather-based recommendations
- Improved recommendation accuracy
- Full backend integration with real-time data

---

## Team

- Garvita Singh — Concept & Introduction  
- Srijan Sharma — Product Vision  
- Ranith Mondal — Technical Development  
- Arnav Goel — Implementation & Demo  
- Karan — Testing & Challenges  

---

## Notes

- Developed as a university project
- Structured commits maintained for evaluation
- Designed for scalability and future expansion
