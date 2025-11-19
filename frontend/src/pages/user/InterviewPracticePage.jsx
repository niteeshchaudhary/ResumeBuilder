import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import InterviewBookingModal from '../../components/InterviewBookingModal';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from '../../assets/AxiosConfig';
import { useNavigate } from 'react-router-dom';

const InterviewPracticePage = () => {
  const { user } = useContext(AuthContext);
  const navigator= useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [userStats, setUserStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    upcomingInterviews: 0,
    averageRating: 0,
    monthlyBookings: 0,
    monthlyLimit: 2,
    remainingThisMonth: 2
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_ENDPOINTS = {
    bookings: `/interview/bookings/`,
    cancel: `/interview/cancel/`,
    stats: `/interview/stats/`,
  };

  useEffect(() => {
    fetchData().then(()=>{
      getUpcomingInterviews();
    })
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching data from:', `${API_ENDPOINTS.bookings}`);
      
      const [bookingsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_ENDPOINTS.bookings}`),
        axios.get(`${API_ENDPOINTS.stats}`)
      ]);

      console.log('🔍 Bookings response status:', bookingsResponse.status);
      console.log('🔍 Stats response status:', statsResponse.status);

      if (bookingsResponse.status==200) {
        const bookingsData = bookingsResponse?.data?.bookings;
        console.log('🔍 Bookings data received:', bookingsData);
        setUserBookings(bookingsData ?? []);
      } else {
        console.error('🔍 Bookings response not ok:', bookingsResponse.status);
        const errorText =  bookingsResponse.data;
        console.error('🔍 Error response:', errorText);
      }

      if (statsResponse.status === 200) {
        const statsData =  statsResponse.data;
        console.log('🔍 Stats data received:', statsData);
        console.log('🔍 Stats data received:', statsData);
        setUserStats(statsData);
      } else {
        console.error('🔍 Stats response not ok:', statsResponse.status);
        const errorText = statsResponse.data;
        console.error('🔍 Error response:', errorText);
      }
    } catch (error) {
      console.error('🔍 Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) {
      return;
    }

    try {
      const response = await axios.post(`${API_ENDPOINTS.cancel}`, { booking_id: bookingId });

      if (response.status === 200) {
        setUserBookings(prevBookings => 
          prevBookings.filter(booking => booking.id !== bookingId)
        );
        fetchData();
        alert('Interview cancelled successfully!');
      } else {
        alert('Failed to cancel interview');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel interview');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPastInterviews = () => {
    console.log('🔍 Filtering past interviews from:', userBookings.length, 'bookings');
    if (!userBookings || !Array.isArray(userBookings)) {
      console.error('🔍 Invalid userBookings data:', userBookings)
      return [];
    }
    const past = userBookings.filter(booking => {
      if (!booking.slot || !booking.slot_details.date) {
        console.log('🔍 Invalid booking structure:', booking);
        return false;
      }
      const isPast = new Date(booking.slot_details.date) < new Date();
      console.log('🔍 Booking date:', booking.slot_details.date, 'isPast:', isPast);
      return isPast;
    });
    console.log('🔍 Found past interviews:', past.length);
    return past;
  };

  const getUpcomingInterviews = () => {
    console.log('🔍 Filtering upcoming interviews from:', userBookings.length,userBookings, 'bookings');
    if (!userBookings || !Array.isArray(userBookings)) {
      console.error('🔍 Invalid userBookings data:', userBookings);
      return [];
    }
    const upcoming = userBookings.filter(booking => {
      if (!booking.slot || !booking.slot_details.date) {
        console.log('🔍 Invalid booking structure:', booking);
        return false;
      }
      const isUpcoming = new Date(booking.slot_details.date) >= new Date();
      console.log('🔍 Booking date:', booking.slot_details.date, 'isUpcoming:', isUpcoming);
      return isUpcoming;
    });
    console.log('🔍 Found upcoming interviews:', upcoming.length);
    return upcoming;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your interview data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
      
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Back Button */}
      <div className="top-4 left-4 z-10">
          <button
            onClick={() => navigator("/u/")}
            className="flex items-center  text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-black bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Interview Practice</h1>
              <p className="text-gray-600 mt-2">Track your progress and manage upcoming sessions</p>
            </div>
            
            {/* Schedule Button */}
            <div className="mt-4 sm:mt-0">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => {
                  if (userStats.remainingThisMonth === 0) {
                    alert('You have reached the monthly limit of 2 interviews. Please try again next month.');
                    return;
                  }
                  setShowBookingModal(true);
                }}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-colors ${
                  userStats.remainingThisMonth === 0 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                }`}
                disabled={userStats.remainingThisMonth === 0}
              >
                {userStats.remainingThisMonth === 0 ? '🚫 Monthly Limit Reached' : '🗓️ Schedule Interview'}
              </button>

              <button
                  onClick={fetchData}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Refresh data"
                >
                  🔄
                </button>
              </div>
              
              {/* Monthly Limit Info */}
              <div className="text-sm text-gray-500 mt-2 text-center sm:text-right">
                {userStats.remainingThisMonth > 0 
                  ? `${userStats.remainingThisMonth} of ${userStats.monthlyLimit} interviews remaining this month`
                  : 'Monthly limit reached'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upcoming Interviews */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ⏰ Upcoming Interviews ({getUpcomingInterviews().length})
          </h2>
          
         
          
          {getUpcomingInterviews().length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🗓️</div>
              <p className="text-gray-600 text-lg">No upcoming interviews scheduled</p>
              <p className="text-gray-500">Click the "Schedule Interview" button above to book your next session</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getUpcomingInterviews().map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="text-2xl mr-3">⏰</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(booking.slot_details.date)}
                          </h3>
                          <p className="text-gray-600">
                            {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
                          </p>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <p className="text-gray-700 mb-3">
                          <span className="font-medium">Notes:</span> {booking.notes}
                        </p>
                      )}

                      {booking.meeting_link && (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          🔗 Join Meeting
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                      {booking.meeting_link && (
                        <button
                          onClick={() => window.open(booking.meeting_link, '_blank')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Join Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Interviews with Results */}
        <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ✅ Past Interviews & Results ({getPastInterviews().length})
          </h2>
          
         
          
          {getPastInterviews().length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-600 text-lg">No past interviews yet</p>
              <p className="text-gray-500">Complete your first interview to see results and ratings here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getPastInterviews().map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="text-2xl mr-3">✅</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(booking.slot_details.date)}
                          </h3>
                          <p className="text-gray-600">
                            {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
                          </p>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <p className="text-gray-700 mb-3">
                          <span className="font-medium">Notes:</span> {booking.notes}
                        </p>
                      )}

                      {/* Interview Results/Rating */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-700">Performance Rating:</span>
                            <div className="flex items-center mt-1">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="ml-2 text-gray-600">4.0/5.0</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">85%</div>
                            <div className="text-sm text-gray-500">Score</div>
                          </div>
                        </div>
                        
                        {/* Feedback Summary */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Feedback:</span> Strong technical skills and good communication. 
                            Consider improving your problem-solving approach and asking clarifying questions.
                          </p>
                        </div>
                      </div>

                      {booking.meeting_link && (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          📹 View Recording
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Your Interview Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalInterviews}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.completedInterviews}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.upcomingInterviews}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Booking Modal */}
      {showBookingModal && (
        <InterviewBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={() => {
            setShowBookingModal(false);
            fetchData(); // Refresh data after successful booking
          }}
        />
      )}
      </div>
    </div>
  );
};

export default InterviewPracticePage;
