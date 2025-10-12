# Frontend Updates - ScaleX

## Overview
The frontend has been updated to integrate with the ScaleX backend API, allowing users to manage their profile data and addresses after Firebase authentication.

## New Features

### 1. **API Service** (`src/services/api.js`)
- Complete API service for communicating with the backend
- Methods for user management (create, read, update, delete)
- Methods for address management (create, read, update, delete)
- Automatic Firebase user synchronization with backend
- Error handling and response management

### 2. **User Profile Page** (`src/modules/auth-social/pages/UserProfile.jsx`)
- Complete user profile management interface
- Personal information form (name, birth date, phone, language)
- Address management with CRUD operations
- Primary address management (only one primary address per user)
- Real-time form validation and error handling
- Success/error message display

### 3. **Updated Navigation** (`src/components/Navbar.jsx`)
- Clickable user avatar and name
- Navigation to profile page on click
- Improved user experience with hover effects
- Tooltips for better UX

### 4. **Enhanced Home Page** (`src/modules/auth-social/pages/Home.jsx`)
- "Completar Perfil" button in user info card
- Direct navigation to profile page
- Better user onboarding flow

### 5. **Updated Routing** (`src/routes/AppRoutes.jsx`)
- New `/profile` route protected by authentication
- Seamless navigation between pages

## Key Features

### **User Profile Management**
- ✅ Personal information editing
- ✅ Birth date validation (cannot be in the future)
- ✅ Phone number validation
- ✅ Language preference selection
- ✅ Real-time form validation

### **Address Management**
- ✅ Add multiple addresses per user
- ✅ Address types: Primary, Billing, Shipping, Other
- ✅ Primary address constraint (only one primary)
- ✅ Complete address information (street, number, city, state, postal code, country)
- ✅ Update and delete addresses
- ✅ Visual indicators for primary address

### **API Integration**
- ✅ Automatic user synchronization with backend
- ✅ Real-time data updates
- ✅ Error handling and user feedback
- ✅ Loading states and success messages

## User Flow

1. **Authentication**: User logs in with Firebase
2. **Auto-sync**: System automatically syncs Firebase user with backend
3. **Profile Setup**: User clicks on avatar/name or "Completar Perfil" button
4. **Data Entry**: User fills in personal information and addresses
5. **Management**: User can update information and manage addresses anytime

## Technical Details

### **API Endpoints Used**
- `POST /users` - Create user
- `GET /users/firebase/:firebaseUid` - Get user by Firebase UID
- `PATCH /users/:id` - Update user
- `GET /users/:id/addresses` - Get user addresses
- `POST /users/:id/addresses` - Create address
- `PATCH /users/:id/addresses/:addressId` - Update address
- `DELETE /users/:id/addresses/:addressId` - Delete address

### **Validation Rules**
- Email format validation
- Birth date cannot be in the future
- Phone number format validation
- Required fields validation
- Address type validation

### **State Management**
- Local state for form data
- Real-time updates to backend
- Optimistic UI updates
- Error state handling

## Usage

1. **Start the backend**: `npm run start:dev` (in back-end directory)
2. **Start the frontend**: `npm run dev` (in front-end directory)
3. **Login with Firebase**: Use the login page
4. **Complete profile**: Click on user avatar/name or "Completar Perfil" button
5. **Manage data**: Add personal information and addresses

## File Structure

```
front-end/src/
├── services/
│   └── api.js                    # API service
├── modules/auth-social/pages/
│   ├── Home.jsx                  # Updated home page
│   └── UserProfile.jsx           # New profile page
├── components/
│   └── Navbar.jsx                # Updated navbar
└── routes/
    └── AppRoutes.jsx             # Updated routes
```

## Dependencies

The frontend uses the existing dependencies:
- React Router DOM for navigation
- Firebase for authentication
- Tailwind CSS for styling
- Fetch API for HTTP requests

No additional dependencies were added.
