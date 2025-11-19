# Interview Booking Feature

## Overview
The Interview Booking feature allows authenticated users to book interview practice sessions through a modal interface. The feature includes a calendar view, booking form, confirmation step, and success screen.

## Features

### 1. Navigation Integration
- **"Book Interview Practice"** button appears in the navbar only after user login
- Integrated in both desktop and mobile navigation views
- Uses the site's existing color palette and hover styles

### 2. Modal Interface
- **Calendar View**: Shows available interview slots for the next 14 days
- **Booking Form**: Collects user name and email
- **Confirmation Step**: Review booking details before final confirmation
- **Success Screen**: Shows booking confirmation with meeting details

### 3. Calendar Features
- Highlights today's date with blue styling
- Shows available vs. booked slots
- Displays slot duration and interviewer information
- Responsive design for mobile and desktop

### 4. User Experience
- Loading states with spinners
- Error handling with retry functionality
- Smooth transitions between steps
- Form validation
- Success confirmation with booking ID

## Technical Implementation

### Components
- **Nav2.jsx**: Main navigation with conditional "Book Interview Practice" button
- **InterviewBookingModal.jsx**: Complete modal implementation

### State Management
- Modal open/close state
- Current step tracking (calendar → booking → confirmation → success)
- Selected slot data
- Form data (name, email)
- Loading and error states

### Dummy Data
Currently uses `generateDummySlots()` function to simulate:
- 14 days of available slots
- 3-5 slots per day between 9 AM - 6 PM
- 30-minute duration slots
- 70% availability rate
- Google Meet join links

## Future Enhancements

### Google Calendar API Integration
- Replace dummy data with real API calls
- Implement OAuth 2.0 authentication
- Real-time slot availability checking
- Calendar synchronization

### Backend Integration
- User authentication verification
- Database storage for bookings
- Email confirmations
- Calendar management

## Usage

1. **User Login**: Must be authenticated to see the button
2. **Open Modal**: Click "Book Interview Practice" in navigation
3. **Select Slot**: Choose from available interview slots
4. **Fill Form**: Enter name and email
5. **Confirm**: Review and confirm booking details
6. **Success**: Receive booking confirmation with meeting link

## Styling
- Follows the site's existing design system
- Dark/light theme support
- Responsive design for all screen sizes
- Consistent with existing component styling
- Hover effects and transitions

## Dependencies
- React (with hooks)
- Headless UI components
- Heroicons
- Tailwind CSS
- Theme context for dark/light mode 