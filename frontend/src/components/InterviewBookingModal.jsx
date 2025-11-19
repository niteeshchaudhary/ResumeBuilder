import React, { Fragment, useState, useEffect, useContext, useCallback, useRef, useMemo, useImperativeHandle } from 'react'
import { Dialog, Transition, Menu } from '@headlessui/react'
import { XMarkIcon, CalendarIcon, ClockIcon, CheckIcon, ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, AdjustmentsHorizontalIcon, UserIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../theme/ThemeContext.jsx'
import { AuthContext } from '../auth/AuthContext'
import axios from '../assets/AxiosConfig.js'

// Simple, stable textarea that won't lose focus
const StableTextarea = React.memo(({ placeholder, required, rows, className }) => {
  const textareaRef = useRef(null)
  
  return (
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={className}
      autoComplete="off"
      spellCheck="false"
    />
  )
})

/*
 * Enhanced Interview Booking Modal Component
 * 
 * Features:
 * - Shows available and booked slots clearly
 * - Integrates with backend API for real data
 * - Google Meet link generation and sharing
 * - User can only see their own booking details
 * - Other users see slots as "Booked" without details
 */

// API endpoints
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/reserish'
const API_ENDPOINTS = {
  slots: `/interview/slots/`,
  bookings: `/interview/bookings/`,
  book: `/interview/book/`,
  cancel: `/interview/cancel/`,
}

export default function InterviewBookingModal({ isOpen, onClose }) {
  const { theme } = useTheme()
  const { authState } = useContext(AuthContext)
  const [currentStep, setCurrentStep] = useState('calendar') // 'calendar', 'booking', 'confirmation', 'success'
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slots, setSlots] = useState([])
  const [userBookings, setUserBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const notesRef = useRef(null)
  

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [viewMode, setViewMode] = useState('month')
  const [minDuration, setMinDuration] = useState(0)

  // Fetch available slots and user bookings
  const fetchData = useCallback(async () => {
    if (!authState.isAuthenticated) return
    
    setLoading(true)
    setError('')
    
    try {
      // Fetch available slots
      const slotsResponse = await axios.get(API_ENDPOINTS.slots)
      console.log('Slots request:', slotsResponse)
      if (!(slotsResponse.status==200)) throw new Error('Failed to fetch slots')
      const slotsData = slotsResponse.data
      console.log('Slots response:', slotsData)
      if (slotsData.success) {
        setSlots(slotsData.slots)
      } else {
        throw new Error(slotsData.error || 'Failed to fetch slots')
      }
      
      // Fetch user bookings
      const bookingsResponse = await axios.get(API_ENDPOINTS.bookings)
      
      if (bookingsResponse.status===200) {
        const bookingsData =  bookingsResponse.data
        console.log('Bookings response:', bookingsData)
        if (bookingsData.success) {
          setUserBookings(bookingsData.bookings)
        }
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load interview slots')
    } finally {
      setLoading(false)
    }
  }, [authState.isAuthenticated])

  useEffect(() => {
    if (isOpen && authState.isAuthenticated) {
      fetchData()
    }
  }, [isOpen, authState.isAuthenticated, fetchData])

  // Focus textarea when booking step is active
  useEffect(() => {
    if (currentStep === 'booking' && notesRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        notesRef.current?.focus()
      }, 100)
    }
  }, [currentStep])

  const handleSlotSelect = (slot) => {
    if (isSlotAvailable(slot)) {
      setSelectedSlot(slot)
      setCurrentStep('booking')
    }
  }



  const isSlotAvailable = (slot) => {
    // Check if slot is available and user hasn't already booked it
    return slot.is_available && !userBookings.some(booking => 
      booking.slot_details.id === slot.id
    )
  }

  const isSlotBookedByUser = (slot) => {
    return userBookings.some(booking => 
      booking.slot_details.id === slot.id && booking.status === 'confirmed'
    )
  }

  const getUserBookingForSlot = (slot) => {
    return userBookings.find(booking => 
      booking.slot_details.id === slot.id
    )
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    // Get notes value from the stable textarea
    if (notesRef.current) {
      setNotes(notesRef.current.value)
    }
    setCurrentStep('confirmation')
  }

  const handleConfirmBooking = async () => {
    setLoading(true)
    
    try {
      // Get the latest notes value from the textarea
      const currentNotes = notesRef.current ? notesRef.current.value : notes
      
      const response = await axios.post(API_ENDPOINTS.book, {
          slot_id: selectedSlot.id,
          notes: currentNotes
        }
      )
      
      if (response.status !== 200) {
        throw new Error(response.data?.error || 'Booking failed')
      }
      
      const data = response.data
      console.log('🔍 Debug: Full booking response:', data)
      console.log('🔍 Debug: Response status:', response.status)
      console.log('🔍 Debug: Response headers:', response.headers)
      console.log('🔍 Debug: Booking data:', data.booking)
      console.log('🔍 Debug: Meeting link:', data.booking?.meeting_link)
      console.log('🔍 Debug: Meeting ID:', data.booking?.meeting_id)
      if (data) {
        setBookingId(data.booking.id)
        setCurrentStep('success')
        
        // Update the userBookings state with the new booking
        if (data.booking) {
          const newBooking = data.booking
          console.log('New booking data:', newBooking)
          console.log('Meeting link from response:', newBooking.meeting_link)
          
          setUserBookings(prevBookings => {
            // Remove any existing booking for this slot
            const filteredBookings = prevBookings.filter(b => b.slot !== selectedSlot.id)
            // Add the new booking
            return [...filteredBookings, newBooking]
          })
        }
        
        // Refresh data to show updated slot status
        fetchData()
      } else {
        throw new Error(data.error || 'Booking failed')
      }
      
    } catch (err) {
      setError(err.message || 'Failed to book interview slot')
      setCurrentStep('booking')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep('calendar')
    setSelectedSlot(null)
    setNotes('')
    setBookingId('')
    setError('')
    onClose()
  }

  const resetModal = () => {
    setCurrentStep('calendar')
    setSelectedSlot(null)
    setNotes('')
    setBookingId('')
    setError('')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return new Date(date).toDateString() === today.toDateString()
  }

  const isSameDay = (d1, d2) => d1 && d2 && new Date(d1).toDateString() === new Date(d2).toDateString()

  const getSlotsForDate = useCallback((date) => {
    return slots.filter(slot => 
      new Date(slot.date).toDateString() === date.toDateString()
    )
  }, [slots])

  // Calendar utilities
  const generateCalendarDays = useCallback(() => {
    const days = []
    const firstOfMonth = new Date(currentMonth)
    const startDay = new Date(firstOfMonth)
    startDay.setDate(1)
    const weekDayIndex = startDay.getDay()
    const gridStart = new Date(firstOfMonth)
    gridStart.setDate(1 - weekDayIndex)
    const total = viewMode === 'week' ? 7 : 42
    for (let i = 0; i < total; i++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      d.setHours(0, 0, 0, 0)
      days.push(d)
    }
    return days
  }, [currentMonth, viewMode])

  const goPrevMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev)
      d.setMonth(prev.getMonth() - 1)
      d.setDate(1)
      return d
    })
  }

  const goNextMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev)
      d.setMonth(prev.getMonth() + 1)
      d.setDate(1)
      return d
          })
    }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const CalendarView = () => (
    <div className="space-y-6">
      {/* Sticky controls */}
      <div className="md:flex md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select Interview Slot
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose a date and time that works best for you
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-2">
          <div className="relative">
            <GlobeAltIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="pl-7 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-label="Timezone"
            >
              {Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone').map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              )) : (
                <option value={timezone}>{timezone}</option>
              )}
            </select>
          </div>
          <div className="relative">
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <select
              value={minDuration}
              onChange={(e) => setMinDuration(parseInt(e.target.value))}
              className="pl-7 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-label="Minimum duration"
            >
              <option value={0}>Any duration</option>
              <option value={30}>30+ min</option>
              <option value={45}>45+ min</option>
              <option value={60}>60+ min</option>
            </select>
          </div>
          <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-xs font-medium ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 text-xs font-medium ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200'}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading available interview slots...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Calendar container */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3">
              <button onClick={goPrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={goNextMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            {/* Grid days */}
            <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-px bg-gray-200 dark:bg-gray-700`} role="grid" aria-label="Calendar grid">
              {generateCalendarDays().map((date, idx) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                const allSlots = getSlotsForDate(date).filter(s => s.duration_minutes >= minDuration)
                const availableCount = allSlots.filter(s => isSlotAvailable(s)).length
                const bookedByUserCount = allSlots.filter(s => isSlotBookedByUser(s)).length
                const hasAnySlots = allSlots.length > 0
                const selected = isSameDay(date, selectedDate)
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-selected={selected}
                    onClick={() => isCurrentMonth && hasAnySlots && handleDateSelect(date)}
                    className={`relative min-h-[76px] sm:min-h-[84px] px-1.5 sm:px-2 py-1.5 sm:py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'
                    } ${selected ? 'ring-2 ring-blue-500 z-10' : ''} ${isCurrentMonth && hasAnySlots ? 'hover:bg-blue-50 dark:hover:bg-gray-800' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}`}>{date.getDate()}</span>
                      {isToday(date) && <span className="hidden sm:block text-[10px] font-medium text-blue-600 dark:text-blue-400">Today</span>}
                    </div>
                    {/* Availability indicators */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {availableCount > 0 && (
                        Array.from({ length: Math.min(availableCount, 3) }).map((_, i) => (
                          <span key={`available-${i}`} className="inline-block h-1.5 w-3 rounded-full bg-green-500" />
                        ))
                      )}
                      {bookedByUserCount > 0 && (
                        Array.from({ length: Math.min(bookedByUserCount, 2) }).map((_, i) => (
                          <span key={`booked-user-${i}`} className="inline-block h-1.5 w-2 rounded-full bg-blue-500" />
                        ))
                      )}
                      {allSlots.length > 0 && availableCount === 0 && bookedByUserCount === 0 && (
                        <span className="text-[10px] text-red-500">Full</span>
                      )}
                    </div>
                    {isCurrentMonth && (availableCount + bookedByUserCount) > 5 && (
                      <span className="absolute bottom-1 right-1 text-[10px] text-gray-700 dark:text-gray-300">+{(availableCount + bookedByUserCount) - 5}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slots for selected date */}
          {selectedDate && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h4>
                </div>
                <div className="text-xs text-blue-900/70 dark:text-blue-200">
                  Times shown in {timezone}
                </div>
              </div>
              
              {getSlotsForDate(selectedDate).filter(s => s.duration_minutes >= minDuration).length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">No slots match your filter on this day.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {getSlotsForDate(selectedDate).filter(s => s.duration_minutes >= minDuration).map((slot) => {
                    const isAvailable = isSlotAvailable(slot)
                    const isBookedByUser = isSlotBookedByUser(slot)
                    const userBooking = getUserBookingForSlot(slot)
                    
                    return (
                      <div
                        key={`${selectedDate.toISOString().split('T')[0]}-${slot.start_time}`}
                        className={`p-3 rounded-lg border transition-all ${
                          isAvailable
                            ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer'
                            : isBookedByUser
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                        }`}
                        onClick={() => isAvailable && handleSlotSelect(slot)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {slot.duration_minutes} min • AI Interview Coach
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {isAvailable ? (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Available</span>
                            ) : isBookedByUser ? (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Your Booking</span>
                            ) : (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Booked</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Show user's booking details */}
                        {isBookedByUser && userBooking && (
                          <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-600">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-700 dark:text-blue-300">Status: {userBooking.status}</span>
                              {userBooking.meeting_link && (
                                <a
                                  href={userBooking.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <VideoCameraIcon className="h-3 w-3 mr-1" />
                                  Join Meeting
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const BookingForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Book Interview Slot
        </h3>
        {selectedSlot && (
          <div className="mt-3 inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.start_time)}
            </span>
          </div>
        )}
      </div>

      {/* User Information Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Booking for</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authState.userDetails?.first_name && authState.userDetails?.last_name 
                ? `${authState.userDetails.first_name} ${authState.userDetails.last_name}`
                : authState.userDetails?.email || 'Authenticated User'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {authState.userDetails?.email}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleBookingSubmit} className="space-y-4">

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Interview Topic
          </label>
                      <StableTextarea
              ref={notesRef}
              placeholder="Any specific topics you'd like to focus on during the interview..."
              required={true}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('calendar')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  )

  const ConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Confirm Your Booking
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Please review your details before confirming
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {authState.userDetails?.first_name && authState.userDetails?.last_name 
              ? `${authState.userDetails.first_name} ${authState.userDetails.last_name}`
              : authState.userDetails?.email.split("@")[0] || 'Authenticated User'
            }
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{authState.userDetails?.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {selectedSlot && formatDate(selectedSlot.date)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {selectedSlot && `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {selectedSlot && `${selectedSlot.duration_minutes} minutes`}
          </span>
        </div>
        {notesRef.current && notesRef.current.value && (
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-xs">{notesRef.current.value}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setCurrentStep('booking')}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleConfirmBooking}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )

  const SuccessScreen = () => {
    const userBooking = userBookings.find(b => b.id === bookingId)
    
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Booking Confirmed!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your interview practice session has been scheduled successfully.
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            📧 Check your email for meeting details and confirmation.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Booking ID:</span>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{bookingId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {selectedSlot && formatDate(selectedSlot.date)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {selectedSlot && `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {selectedSlot && `${selectedSlot.duration_minutes} minutes`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interviewer:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              AI Interview Coach
            </span>
          </div>
        </div>

        {userBooking?.meeting_link && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join your interview practice session using the link below:
            </p>
            <a
              href={userBooking.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <VideoCameraIcon className="h-4 w-4 mr-2" />
              Join Meeting
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This link will also be shared with our team. Please join 5 minutes before your scheduled time.
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={resetModal}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Book Another Slot
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    {currentStep === 'calendar' && <CalendarView />}
                    {currentStep === 'booking' && <BookingForm />}
                    {currentStep === 'confirmation' && <ConfirmationStep />}
                    {currentStep === 'success' && <SuccessScreen />}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 