# 🏆 WWE Season Tracker - Multi-Page React App

A **stunning, modern React application** with **multi-page navigation** to track WWE season results and individual event statistics.

## ✨ New Multi-Page Structure

### 🏠 **HOME PAGE** (`/`)
- **Season Overview**: "The Road to WrestleMania 2026"
- **Global Leaderboard**: All 25 competitors ranked by total season points
- **Event Cards**: Click to navigate to individual event pages
- **Gambler Stats**: Accuracy rate and best event for each competitor
- **Event History**: Performance breakdown across all events

### 📅 **EVENT PAGES** (`/event/:filename`)
- **Back Button**: Easy navigation to home
- **Event Header**: Date, location, and quick stats
- **Four Tabs**: Leaderboard, Matches, Gamblers, Stats
- **Detailed Results**: Complete match and gambler data

## 🚀 How to Use

### **View the App:**
```
http://localhost:5173
```

### **Navigation:**
1. Start on **Home Page** - See season standings
2. **Click any event card** - View event details
3. **Switch tabs** - Explore different views
4. **Click "Back to Season"** - Return home

## 📂 Data Files

### Current Files:
- `global_leaderboard.json` - Season overview data (Home page)
- `Elimination_Chamber_2025.json` - Event results (Event page)

### Adding New Events:

1. **Create JSON file** in `public/` folder:
   ```
   Royal_Rumble_2026.json
   WrestleMania_42.json
   ```

2. **Update** `global_leaderboard.json` with new event

3. **Automatic!** Event appears on home page

## 🎨 Features

### Home Page
✅ Season title with animated header
✅ Total events and competitors count
✅ Clickable event cards
✅ Global leaderboard with rankings
✅ Medal emojis for top 3 (🥇🥈🥉)
✅ Event history per gambler
✅ Accuracy rates

### Event Pages
✅ Event-specific header
✅ Leaderboard tab with event rankings
✅ Matches tab with all results
✅ Gamblers tab with profiles
✅ Stats tab with analytics
✅ Smooth tab transitions
✅ Back button navigation

## 🛠️ Technology

- **React 18** with Hooks
- **React Router DOM** for navigation
- **Vite** build tool
- **Framer Motion** animations
- **Lucide React** icons
- **Custom CSS** with glassmorphism

## 🚀 Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 📱 Responsive Design

- Desktop: Full multi-column layouts
- Tablet: Optimized grids
- Mobile: Single column, touch-friendly

## 🎉 What's New

🆕 Multi-page architecture with React Router
🆕 Home page with season overview
🆕 Individual pages for each event
🆕 Clickable navigation between pages
🆕 Global leaderboard tracking
🆕 Event history per gambler
🆕 Back button for easy navigation
🆕 Scalable for unlimited events

---

**Built with ❤️ using React Router, Vite, and Framer Motion**

