
import { useState, useRef, useEffect ,useContext } from 'react'
import { AuthContext } from '../../../auth/AuthContext'
import axios from '../../../assets/AxiosConfig';

export default function AiInterviewNew() {
  const { authState } = useContext(AuthContext)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [messages, setMessages] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState('')
  const [finalTranscription, setFinalTranscription] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [showSetupForm, setShowSetupForm] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [aiEvaluation, setAiEvaluation] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true)
  const [silenceTimer, setSilenceTimer] = useState(null)
  const [lastAISpeechTime, setLastAISpeechTime] = useState(null)
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const isInterviewStartedRef = useRef(false)
  const isUserSpeakingRef = useRef(false)
  const aiFinishedSpeakingRef = useRef(false)
  const lastAISpeechTimeRef = useRef(null)

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setIsCallActive(true)
      setIsVideoOn(true) // Ensure video is on when call starts
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Please allow camera and microphone access to start the interview.')
    }
  }

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      alert('Please provide a job description to start the interview.')
      return
    }

    try {
      setIsLoading(true)
      
      // First start the call (camera/microphone)
      await startCall()
      
        // Hide the setup form and show the interview interface
        setShowSetupForm(false)
        
        // Open chat sidebar when interview starts
        setIsChatOpen(true)
        
        // Then immediately start the interview
        await startInterview()
      
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('Failed to start interview. Please try again.')
      // Reset to setup form if there's an error
      setShowSetupForm(true)
    } finally {
      setIsLoading(false)
    }
  }

  const endCall = async () => {
    try {
      // Call backend API to properly end the interview session
      if (conversationId) {
        try {
          await axios.post(`/interview/ai/end/`, {
            conversation_id: conversationId
          })
          console.log('Interview session ended successfully')
        } catch (error) {
          console.error('Error ending interview session:', error)
          // Continue with cleanup even if API call fails
        }
      }
    } catch (error) {
      console.error('Error in endCall:', error)
    } finally {
      // Clean up all resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
      // Clear any pending timeouts
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
      
      // Reset all states
      setIsCallActive(false)
      setMessages([])
      setCurrentQuestion('')
      setIsInterviewStarted(false)
      isInterviewStartedRef.current = false
      setIsAISpeaking(false)
      setIsUserSpeaking(false)
      isUserSpeakingRef.current = false
      setCurrentTranscription('')
      setFinalTranscription('')
      setWaitingForUserResponse(false)
      aiFinishedSpeakingRef.current = false
      setShowSetupForm(true)
      setInterviewQuestions([])
      setConversationId(null)
      setAiEvaluation(null)
      setIsChatOpen(false)
    }
  }

  const toggleVideo = () => {
    console.log('toggleVideo called, current isVideoOn:', isVideoOn)
    const newVideoState = !isVideoOn
    
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      console.log('Video tracks found:', videoTracks.length)
      
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0]
        console.log('Video track before change:', {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted
        })
        
        // Simply toggle the enabled property
        videoTrack.enabled = newVideoState
        console.log('Video track after change:', {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted
        })
        
        // Update video element display
        if (videoRef.current) {
          if (newVideoState) {
            videoRef.current.style.display = 'block'
            videoRef.current.style.opacity = '1'
            console.log('Video element enabled')
          } else {
            videoRef.current.style.display = 'none'
            videoRef.current.style.opacity = '0'
            console.log('Video element disabled')
          }
        }
      } else {
        console.log('No video track found')
      }
    } else {
      console.log('No stream found')
    }
    
    setIsVideoOn(newVideoState)
  }

  const toggleAudio = () => {
    console.log('toggleAudio called, current isAudioOn:', isAudioOn)
    const newAudioState = !isAudioOn
    
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      console.log('Audio tracks found:', audioTracks.length)
      
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0]
        console.log('Audio track before change:', {
          enabled: audioTrack.enabled,
          readyState: audioTrack.readyState,
          muted: audioTrack.muted
        })
        
        audioTrack.enabled = newAudioState
        console.log('Audio track after change:', {
          enabled: audioTrack.enabled,
          readyState: audioTrack.readyState,
          muted: audioTrack.muted
        })
      } else {
        console.log('No audio track found')
      }
    } else {
      console.log('No stream found')
    }
    
    // Also control speech recognition based on audio state
    if (recognitionRef.current) {
      if (newAudioState) {
        // Unmuting - restart speech recognition if interview is active
        if (isInterviewStartedRef.current && isCallActive) {
          console.log('Restarting speech recognition after unmuting')
          try {
            recognitionRef.current.start()
          } catch (error) {
            console.log('Speech recognition already running or error:', error)
          }
        }
      } else {
        // Muting - stop speech recognition aggressively
        console.log('Stopping speech recognition after muting')
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log('Error stopping speech recognition:', error)
        }
        setIsUserSpeaking(false)
        isUserSpeakingRef.current = false
        
        // Clear any pending timeouts
        if (silenceTimer) {
          clearTimeout(silenceTimer)
          setSilenceTimer(null)
        }
      }
    }
    
    // Note: We're not stopping audio tracks completely to avoid breaking the stream
    
    setIsAudioOn(newAudioState)
  }

  const toggleSpeech = () => {
    console.log('toggleSpeech called, current isSpeechEnabled:', isSpeechEnabled)
    const newSpeechEnabled = !isSpeechEnabled
    setIsSpeechEnabled(newSpeechEnabled)
    console.log('Speech enabled set to:', newSpeechEnabled)
    
    if (!newSpeechEnabled) {
      // If turning off speech, cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        setIsAISpeaking(false)
        aiFinishedSpeakingRef.current = true
        console.log('Speech synthesis cancelled')
      }
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window && isSpeechEnabled) {
      // Immediately stop speech recognition and set AI speaking state
      if (recognitionRef.current) {
        console.log('Stopping speech recognition before AI speaks')
        recognitionRef.current.stop()
      }
      
      // Set AI speaking state immediately
      setIsAISpeaking(true)
      aiFinishedSpeakingRef.current = false
      const aiSpeechStartTime = Date.now()
      setLastAISpeechTime(aiSpeechStartTime)
      lastAISpeechTimeRef.current = aiSpeechStartTime
      
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => {
        console.log('AI started speaking:', text)
        // Ensure speech recognition stays stopped
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }
      utterance.onend = () => {
        console.log('AI finished speaking:', text)
        setIsAISpeaking(false)
        aiFinishedSpeakingRef.current = true
        
        // Only restart speech recognition if user is not currently speaking
        if (!isUserSpeakingRef.current) {
          setTimeout(() => {
            if (recognitionRef.current && isInterviewStartedRef.current) {
              recognitionRef.current.start()
            }
          }, 200) // Minimal delay with echo cancellation
        }
      }
      
      window.speechSynthesis.speak(utterance)
    } else {
      console.log('Speech synthesis not available or disabled')
    }
  }

  const startInterview = async () => {
    if (!jobDescription.trim()) {
      alert('Please provide a job description to start the interview.')
      return
    }

    try {
      setIsLoading(true)
      
      // Start AI interview session
      const response = await axios.post(`/interview/ai/start/`,{
          job_description: jobDescription,
          user_resume_summary: 'Experienced professional seeking new opportunities',
          question_count: 5,
          difficulty: 'medium'
      })

      if (response.status === 200) {
        const result = await response.data;
        
        setConversationId(result.conversation_id)
        setInterviewQuestions(result.questions)
        setShowSetupForm(false)
        
        setIsInterviewStarted(true)
        isInterviewStartedRef.current = true
        setCurrentQuestionIndex(0)
        setFinalTranscription('')
        setWaitingForUserResponse(false)
        
        // Start with a welcome message
        const welcomeMessage = {
          id: Date.now(),
          sender: 'AI Interviewer',
          text: 'Welcome to your AI-powered interview! I will ask you questions based on the job description you provided.',
          timestamp: new Date().toLocaleTimeString()
        }
        
        setMessages([welcomeMessage])
        speakText('Welcome to your AI-powered interview! I will ask you questions based on the job description you provided.')
        
        // Start speech recognition and first question
        setTimeout(() => {
          startSpeechRecognition()
          setTimeout(() => {
            askQuestion(0)
          }, 1000)
        }, 4000)
      } else {
        const errorData = await response.json()
        alert(`Failed to start interview: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('Failed to start interview. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event) => {
        // Don't process speech recognition results if audio is muted
        if (!isAudioOn) {
          console.log('Ignoring speech recognition result - audio is muted')
          return
        }
        
        // Don't process speech recognition results if AI is currently speaking
        if (isAISpeaking || aiFinishedSpeakingRef.current === false) {
          console.log('Ignoring speech recognition result - AI is speaking')
          return
        }
        
        // Only check timing if we just finished AI speech (very short buffer)
        const currentTime = Date.now()
        if (lastAISpeechTimeRef.current && (currentTime - lastAISpeechTimeRef.current) < 200) {
          console.log('Ignoring speech recognition result - too close to AI speech time')
          return
        }
        
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setCurrentTranscription(interimTranscript)
        
        if (finalTranscript && finalTranscript.trim().length > 0) {
          console.log('User speech detected:', finalTranscript)
          setFinalTranscription(prev => prev + finalTranscript)
          setCurrentTranscription('')
          
          // Clear silence timer since user is speaking
          if (silenceTimer) {
            clearTimeout(silenceTimer)
            setSilenceTimer(null)
          }
          
          // Add user response to messages
          const userMessage = {
            id: Date.now(),
            sender: 'You',
            text: finalTranscript.trim(),
            timestamp: new Date().toLocaleTimeString()
          }
          setMessages(prev => [...prev, userMessage])
          
          // Submit response to backend for AI evaluation
          console.log('Submitting response to AI:', finalTranscript.trim())
          submitResponseToAI(finalTranscript.trim())
          
          // Restart listening after processing response
          setTimeout(() => {
            if (isInterviewStartedRef.current && !isAISpeaking && !isUserSpeakingRef.current) {
              console.log('Restarting listening after processing user response')
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start()
                } catch (error) {
                  console.log('Speech recognition already running or error:', error)
                }
              }
            }
          }, 1000)
        }
      }
      
      recognitionRef.current.onspeechstart = () => {
        console.log('User started speaking')
        setIsUserSpeaking(true)
        isUserSpeakingRef.current = true
        setWaitingForUserResponse(false)
        
        // Clear silence timer when user starts speaking
        if (silenceTimer) {
          clearTimeout(silenceTimer)
          setSilenceTimer(null)
          console.log('Cleared silence timer - user started speaking')
        }
        
        // If AI is speaking, stop it to let user continue
        if (isAISpeaking) {
          console.log('User interrupted AI, stopping AI speech')
          window.speechSynthesis.cancel()
          setIsAISpeaking(false)
          aiFinishedSpeakingRef.current = true
        }
      }
      
      recognitionRef.current.onspeechend = () => {
        console.log('User stopped speaking')
        setIsUserSpeaking(false)
        isUserSpeakingRef.current = false
        
        // Start silence timeout after user stops speaking
        if (waitingForUserResponse) {
          console.log('User stopped speaking, starting silence timeout')
          const timer = setTimeout(() => {
            console.log('Silence timeout - moving to next question')
            // Only proceed if user is still not speaking
            if (!isUserSpeakingRef.current && waitingForUserResponse) {
              moveToNextQuestion()
            }
          }, 5000) // 5 second silence timeout
          
          setSilenceTimer(timer)
          console.log('Silence timer set for 5 seconds after user stopped speaking')
        }
      }
      
      recognitionRef.current.start()
    } else {
      alert('Speech recognition not supported in this browser.')
    }
  }

  const submitResponseToAI = async (userResponse) => {
    if (!conversationId) return

    // Clear silence timer when processing user response
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
      console.log('Cleared silence timer - processing user response')
    }

    try {
      const response = await axios.post(`/interview/ai/submit-response/`, {
          conversation_id: conversationId,
          question_text: currentQuestion,
          user_response: userResponse,
          question_data: interviewQuestions[currentQuestionIndex],
          response_duration: 0

      })

      if (response.status === 200) {
        const result = await response.data
        setAiEvaluation(result.evaluation)
        
        // Add AI evaluation message
        const evaluationMessage = {
          id: Date.now() + 2,
          sender: 'AI Interviewer',
          text: `Evaluation: ${result.evaluation.feedback}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'evaluation',
          evaluation: result.evaluation
        }
        
        setMessages(prev => [...prev, evaluationMessage])
        
        // Move to next question after processing response
        console.log('Moving to next question after AI evaluation')
        setTimeout(() => {
          moveToNextQuestion()
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting response to AI:', error)
      // Still move to next question even if there's an error
      setTimeout(() => {
        moveToNextQuestion()
      }, 2000)
    }
  }

  const moveToNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => {
      const nextIndex = prevIndex + 1
      if (nextIndex < interviewQuestions.length) {
        askQuestion(nextIndex)
      } else {
        completeInterview()
      }
      return nextIndex
    })
  }

  const completeInterview = async () => {
    try {
      const response = await axios.post(`/interview/ai/end/`, {
          conversation_id: conversationId
      })

      if (response.status === 200) {
        const result = await response.data;
        
        const completionMessage = {
          id: Date.now() + 1,
          sender: 'AI Interviewer',
          text: 'Thank you for completing the interview! Here is your evaluation summary.',
          timestamp: new Date().toLocaleTimeString(),
          type: 'completion'
        }
        
        setMessages(prev => [...prev, completionMessage])
        setCurrentQuestion('')
        setWaitingForUserResponse(false)
        speakText('Thank you for completing the interview! Here is your evaluation summary.')
        setIsInterviewStarted(false)
        isInterviewStartedRef.current = false
        
        if (result.summary) {
          setAiEvaluation(result.summary)
        }
      }
    } catch (error) {
      console.error('Error ending interview:', error)
    } finally {
      // Clean up resources after interview completion
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
      // Clear any pending timeouts
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
      
      // Reset additional states
      setIsAISpeaking(false)
      setIsUserSpeaking(false)
      isUserSpeakingRef.current = false
      setCurrentTranscription('')
      setFinalTranscription('')
      aiFinishedSpeakingRef.current = false
    }
  }

  const askQuestion = (questionIndex) => {
    if (questionIndex < interviewQuestions.length && isInterviewStarted) {
      setCurrentQuestionIndex(questionIndex)
      const question = interviewQuestions[questionIndex]
      setCurrentQuestion(question.question_text)
      
      const aiMessage = {
        id: Date.now(),
        sender: 'AI Interviewer',
        text: question.question_text,
        timestamp: new Date().toLocaleTimeString(),
        questionData: question
      }
      
      setMessages(prev => [...prev, aiMessage])
      setWaitingForUserResponse(true)
      speakText(question.question_text)
      
      // The speakText function will handle starting listening after AI finishes speaking
    }
  }

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer)
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Effect to ensure video stream is set when video element is available
  useEffect(() => {
    if (videoRef.current && streamRef.current && isCallActive) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCallActive, isVideoOn])

  if (showSetupForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Setup
            </h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configure Your AI Interview</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here. The AI will generate relevant questions based on this..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              
              <button
                onClick={handleStartInterview}
                disabled={!jobDescription.trim() || isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : '🚀 Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Google Meet-like Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-900">AI Interview</h1>
              <p className="text-sm text-gray-500">
                {isCallActive ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCallActive && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            )}
            <button
              onClick={endCall}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      {/* Main Video Conference Layout */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
        {/* Video Grid */}
        <div className="flex-1 bg-gray-900 p-4">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* AI Interviewer Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl transition-all duration-300 ${
                  isAISpeaking ? 'scale-110 shadow-blue-500/50' : ''
                }`}>
                  AI
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                AI Interviewer
              </div>
              {isAISpeaking && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                  Speaking
                </div>
              )}
            </div>

            {/* User Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transition-all duration-300"
                style={{ 
                  display: isVideoOn ? 'block' : 'none',
                  opacity: isVideoOn ? 1 : 0
                }}
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">📹</span>
                    </div>
                    <p className="text-white text-sm">Camera is off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                You
              </div>
              {isUserSpeaking && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                  Speaking
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-center space-x-4">
            {/* Microphone Toggle */}
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isAudioOn 
                  ? 'bg-gray-200 hover:bg-gray-300' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioOn ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              )}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn 
                  ? 'bg-gray-200 hover:bg-gray-300' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2zM5 16V8h1.73l8 8H5z"/>
                </svg>
              )}
            </button>

            {/* AI Voice Toggle */}
            <button
              onClick={toggleSpeech}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isSpeechEnabled 
                  ? 'bg-gray-200 hover:bg-gray-300' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isSpeechEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
            >
              {isSpeechEnabled ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              )}
            </button>

            {/* Chat Toggle */}
            {isInterviewStarted && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isChatOpen 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={isChatOpen ? 'Close chat' : 'Open chat'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </button>
            )}

            {/* Start Interview Button */}
            {!isInterviewStarted && isCallActive && (
              <button
                onClick={startInterview}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isLoading ? 'Starting...' : 'Start Interview'}
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              title="End call"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.28 0-.53-.11-.71-.29-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar - Only show when interview is started and chat is open */}
      {isInterviewStarted && isChatOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-50">
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Interview Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Close chat"
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Current Question */}
              {currentQuestion && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Current Question:</h4>
                  <p className="text-blue-800 text-sm">{currentQuestion}</p>
                </div>
              )}

              {/* Live Transcription */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Live Transcription</h4>
                {finalTranscription && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-800">{finalTranscription}</p>
                  </div>
                )}
                {currentTranscription && (
                  <div className="bg-green-100 p-3 rounded border">
                    <p className="text-sm text-green-800 italic">Listening: {currentTranscription}</p>
                  </div>
                )}
                {!currentTranscription && !finalTranscription && (
                  <div className="text-center text-gray-500 text-sm">
                    {isUserSpeaking ? 'You are speaking...' : 'Speak your answer'}
                  </div>
                )}
              </div>

              {/* AI Evaluation */}
              {aiEvaluation && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">AI Evaluation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Score:</span>
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm font-bold">
                        {aiEvaluation.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-yellow-800">{aiEvaluation.feedback}</p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-3">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg ${
                      message.sender === 'You' 
                        ? 'bg-blue-100 ml-4' 
                        : 'bg-gray-100 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-600">{message.sender}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-800">{message.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
