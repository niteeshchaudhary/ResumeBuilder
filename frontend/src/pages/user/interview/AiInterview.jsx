import { useState, useRef, useEffect ,useContext } from 'react'
import { AuthContext } from '../../../auth/AuthContext'
import axios from '../../../assets/AxiosConfig';

export default function AiInterview() {
  const { authState } = useContext(AuthContext)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [messages, setMessages] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true)
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState('')
  const [finalTranscription, setFinalTranscription] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [lastUserResponseTime, setLastUserResponseTime] = useState(null)
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [userResumeSummary, setUserResumeSummary] = useState('')
  const [showSetupForm, setShowSetupForm] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionData, setCurrentQuestionData] = useState(null)
  const [aiEvaluation, setAiEvaluation] = useState(null)
  const [followUpQuestion, setFollowUpQuestion] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [silenceTimer, setSilenceTimer] = useState(null)
  const [userSpeakingTimer, setUserSpeakingTimer] = useState(null)
  const [lastUserSpeechTime, setLastUserSpeechTime] = useState(null)
  const [lastAISpeechTime, setLastAISpeechTime] = useState(null)
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const questionTimeoutRef = useRef(null)
  const userResponseTimeoutRef = useRef(null)
  const isInterviewStartedRef = useRef(false)
  const isUserSpeakingRef = useRef(false)
  const aiFinishedSpeakingRef = useRef(false)
  const responseStartTimeRef = useRef(null)
  const waitingForUserResponseRef = useRef(false)
  const interviewQuestionsRef = useRef([])
  const lastAISpeechTimeRef = useRef(null)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/reserish'

  // Helper function to detect filler words
  const detectFillerWords = (text) => {
    const fillerWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
    const lowerText = text.toLowerCase();
    
    // Only detect as filler if the text is very short or contains multiple filler words
    const words = lowerText.split(' ');
    const fillerCount = words.filter(word => fillerWords.includes(word)).length;
    
    // If more than 50% of words are fillers, or if it's just 1-2 words and they're all fillers
    return fillerCount > words.length * 0.5 || (words.length <= 2 && fillerCount === words.length);
  }

  // Start manual recording
  const startRecording = () => {
    console.log('Starting manual recording')
    setIsRecording(true)
    setRecordedResponse('')
    setCurrentTranscription('')
    setFinalTranscription('')
    responseStartTimeRef.current = Date.now()
    
    // Start speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.log('Speech recognition already running')
      }
    }
  }

  // Stop manual recording
  const stopRecording = () => {
    console.log('Stopping manual recording')
    setIsRecording(false)
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    // Process the recorded response
    const fullResponse = (finalTranscription + ' ' + currentTranscription).trim()
    if (fullResponse) {
      setRecordedResponse(fullResponse)
      
      // Add user response to messages
      const userMessage = {
        id: Date.now(),
        sender: 'You',
        text: fullResponse,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, userMessage])
      
      // Process the response
      processUserResponse(fullResponse)
    } else {
      console.log('No response recorded')
      // Show message that no response was detected
      const noResponseMessage = {
        id: Date.now(),
        sender: 'System',
        text: 'No response detected. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        type: 'error'
      }
      setMessages(prev => [...prev, noResponseMessage])
      
      // Show recording controls again
      setShowRecordingControls(true)
    }
  }

  // Helper function to start listening for user response
  const startListening = () => {
    console.log('Starting to listen for user response')
    console.log('Current state - isListening:', isListening, 'waitingForUserResponse:', waitingForUserResponse)
    console.log('waitingForUserResponseRef:', waitingForUserResponseRef.current)
    console.log('AI speaking state - isAISpeaking:', isAISpeaking, 'aiFinishedSpeakingRef:', aiFinishedSpeakingRef.current)
    console.log('Audio enabled:', isAudioOn)
    
    // Don't start listening if audio is muted
    if (!isAudioOn) {
      console.log('Audio is muted, not starting listening')
      return
    }
    
    // Don't start listening if AI is currently speaking
    if (isAISpeaking || aiFinishedSpeakingRef.current === false) {
      console.log('AI is speaking, not starting listening')
      return
    }
    
    // Don't start listening if already listening
    if (isListening) {
      console.log('Already listening, skipping')
      return
    }
    
    // Set waiting for response if not already set
    if (!waitingForUserResponseRef.current) {
      console.log('Setting waitingForUserResponse to true')
      setWaitingForUserResponse(true)
      waitingForUserResponseRef.current = true
    }
    
    setIsListening(true)
    
    // Clear any existing timers
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
    }
    
    // Start silence timer (5 seconds) - only if we're actually waiting for a response
    if (waitingForUserResponseRef.current) {
      const timer = setTimeout(() => {
        console.log('Silence timeout triggered, isListening:', isListening, 'isUserSpeaking:', isUserSpeaking)
        handleSilenceTimeout()
      }, 5000)
      
      setSilenceTimer(timer)
      console.log('Silence timer set for 5 seconds')
    }
    
    // Ensure speech recognition is running
    if (recognitionRef.current && isInterviewStartedRef.current) {
      console.log('Speech recognition is available, starting it')
      try {
        recognitionRef.current.start()
        console.log('Speech recognition started successfully')
      } catch (error) {
        console.log('Speech recognition already running or error:', error)
      }
    } else {
      console.log('Speech recognition not available')
    }
  }

  // Handle silence timeout (after 5 seconds)
  const handleSilenceTimeout = () => {
    console.log('Handling silence timeout - asking follow-up question')
    console.log('Current state - isListening:', isListening, 'waitingForUserResponse:', waitingForUserResponse, 'isInterviewStarted:', isInterviewStarted)
    console.log('Ref state - waitingForUserResponseRef:', waitingForUserResponseRef.current, 'isInterviewStartedRef:', isInterviewStartedRef.current)
    console.log('User speaking state - isUserSpeaking:', isUserSpeaking, 'isUserSpeakingRef:', isUserSpeakingRef.current)
    
    // Only proceed if we're actually waiting for a response and user is not speaking
    if (!waitingForUserResponseRef.current || !isInterviewStartedRef.current || isUserSpeakingRef.current) {
      console.log('Not waiting for response, interview not started, or user is speaking - skipping silence timeout')
      return
    }
    
    const followUpMessage = "Is there anything else you'd like to add to your answer?"
    speakText(followUpMessage)
    
    // Add follow-up message to chat
    const followUpChatMessage = {
      id: Date.now(),
      sender: 'AI Interviewer',
      text: followUpMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'follow_up'
    }
    setMessages(prev => [...prev, followUpChatMessage])
    
    // Start extended listening for yes/no response (10 more seconds)
    const extendedTimer = setTimeout(() => {
      console.log('Extended silence timeout - moving to next question')
      // Check again if user is speaking before proceeding
      if (!isUserSpeakingRef.current && waitingForUserResponseRef.current) {
        handleExtendedSilenceTimeout()
      }
    }, 10000) // 10 more seconds
    
    setSilenceTimer(extendedTimer)
  }

  // Handle extended silence timeout (after total 15 seconds)
  const handleExtendedSilenceTimeout = () => {
    console.log('Extended silence timeout - checking if user is still not speaking')
    console.log('User speaking state - isUserSpeaking:', isUserSpeaking, 'isUserSpeakingRef:', isUserSpeakingRef.current)
    
    // Final check - only proceed if user is definitely not speaking
    if (isUserSpeakingRef.current) {
      console.log('User is speaking, canceling extended timeout')
      return
    }
    
    const timeoutMessage = "I understand you might need more time to think. Let's move on to the next question."
    speakText(timeoutMessage)
    
    // Add timeout message to chat
    const timeoutChatMessage = {
      id: Date.now(),
      sender: 'AI Interviewer',
      text: timeoutMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'timeout'
    }
    setMessages(prev => [...prev, timeoutChatMessage])
    
    // Move to next question after a short delay
    setTimeout(() => {
      moveToNextQuestion()
    }, 2000)
  }

  // Handle user response processing
  const processUserResponse = (responseText) => {
    console.log('Processing user response:', responseText)
    
    // Clear all timeouts when processing user response
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
      console.log('Cleared silence timer - processing user response')
    }
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current)
      questionTimeoutRef.current = null
    }
    if (userResponseTimeoutRef.current) {
      clearTimeout(userResponseTimeoutRef.current)
      userResponseTimeoutRef.current = null
    }
    
    // Stop listening while processing response
    setIsListening(false)
    waitingForUserResponseRef.current = false
    
    // Ensure we're in interview state - this should be set by askQuestionWithQuestions
    if (!isInterviewStartedRef.current) {
      console.log('Not in interview state, this should not happen')
      return
    }
    
    setIsProcessingResponse(true)
    setShowRecordingControls(false)
    setIsRecording(false)
    setWaitingForUserResponse(false)
    waitingForUserResponseRef.current = false
    setCurrentTranscription('')
    setFinalTranscription('')
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Speech recognition already stopped')
      }
      setMessages(prev => [...prev, confirmationChatMessage])
      
      // Move to next question after a short delay
      setTimeout(() => {
        moveToNextQuestion()
      }, 2000)
    } else if (lowerResponse.includes('yes') || lowerResponse.includes('sure') || lowerResponse.includes('okay')) {
      // User wants to continue, keep listening
      const continueMessage = "Please go ahead."
      speakText(continueMessage)
      
      const continueChatMessage = {
        id: Date.now(),
        sender: 'AI Interviewer',
        text: continueMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: 'encouragement'
      }
      setMessages(prev => [...prev, continueChatMessage])
      
      // Restart listening after encouraging response
      setTimeout(() => {
        startListening()
      }, 1000)
    } else {
      // Regular response, process it
      console.log('Submitting regular response to AI:', responseText)
      submitResponseToAI(responseText)
    }
    
    // Submit response to AI
    submitResponseToAI(responseText)
  }

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
      setIsVideoOn(true)
      
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
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current)
      }
      if (userResponseTimeoutRef.current) {
        clearTimeout(userResponseTimeoutRef.current)
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
      
      // Reset all states
      setIsCallActive(false)
      setIsRecording(false)
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
      waitingForUserResponseRef.current = false
      aiFinishedSpeakingRef.current = false
      setShowSetupForm(true)
      setInterviewQuestions([])
      interviewQuestionsRef.current = []
      setConversationId(null)
      setSessionId(null)
      setAiEvaluation(null)
      setFollowUpQuestion(null)
      setIsChatOpen(false)
      setIsListening(false)
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
        setIsListening(false)
        setIsUserSpeaking(false)
        isUserSpeakingRef.current = false
        
        // Clear any pending timeouts
        if (silenceTimer) {
          clearTimeout(silenceTimer)
          setSilenceTimer(null)
        }
        if (questionTimeoutRef.current) {
          clearTimeout(questionTimeoutRef.current)
        }
        if (userResponseTimeoutRef.current) {
          clearTimeout(userResponseTimeoutRef.current)
        }
      }
    }
    
    // Note: We're not stopping audio tracks completely to avoid breaking the stream
    
    setIsAudioOn(newAudioState)
  }

  const speakText = (text) => {
    console.log('speakText called with:', text)
    
    if ('speechSynthesis' in window && isSpeechEnabled) {
      // Immediately stop speech recognition and set AI speaking state
      if (recognitionRef.current) {
        console.log('Stopping speech recognition before AI speaks')
        recognitionRef.current.stop()
        setIsListening(false)
      }
      
      // Set AI speaking state immediately
      setIsAISpeaking(true)
      aiFinishedSpeakingRef.current = false
      const aiSpeechStartTime = Date.now()
      setLastAISpeechTime(aiSpeechStartTime)
      lastAISpeechTimeRef.current = aiSpeechStartTime
      
      // Cancel any ongoing speech and wait a bit
      window.speechSynthesis.cancel()
      
      // Wait a moment before starting new speech to avoid interruption
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        
        // Try to use a professional-sounding voice
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Microsoft') || 
          voice.name.includes('Google') || 
          voice.name.includes('Alex') ||
          voice.lang.includes('en')
        )
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
        
        // Track speaking state
        utterance.onstart = () => {
          console.log('AI started speaking:', text)
          // Ensure speech recognition stays stopped
          if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
          }
        }
        utterance.onend = () => {
          console.log('AI finished speaking:', text)
          setIsAISpeaking(false)
          aiFinishedSpeakingRef.current = true
          
          // Wait before restarting speech recognition to prevent feedback
          if (waitingForUserResponseRef.current && isInterviewStartedRef.current && !isUserSpeakingRef.current) {
            console.log('Starting listening after AI finished speaking')
            setTimeout(() => {
              if (waitingForUserResponseRef.current && isInterviewStartedRef.current && !isUserSpeakingRef.current) {
                startListening()
              }
            }, 200) // Minimal delay with echo cancellation
          }
        }
        utterance.onerror = (event) => {
          console.log('AI speech error:', event.error)
          setIsAISpeaking(false)
          aiFinishedSpeakingRef.current = true
          
          // Start listening even if speech fails, but only if user is not speaking
          if (waitingForUserResponse && !isUserSpeakingRef.current) {
            console.log('Starting listening after AI speech error')
            setTimeout(() => {
              if (waitingForUserResponseRef.current && isInterviewStartedRef.current && !isUserSpeakingRef.current) {
                startListening()
              }
            }, 200) // Minimal delay with echo cancellation
          }
        }
        
        console.log('Speaking utterance:', utterance)
        window.speechSynthesis.speak(utterance)
      }, 100) // Reduced delay to allow faster user response
    } else {
      console.log('Speech synthesis not available or disabled')
      // If speech is disabled, still show recording controls for questions
      if (waitingForUserResponseRef.current) {
        setTimeout(() => {
          startListening()
        }, 500)
      }
    }
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

  // const moveToNextQuestion = () => {
  //   if (isProcessingResponse) {
  //     console.log('Already processing, skipping moveToNextQuestion')
  //     return
  //   }
    
  //   // Wait for user to start speaking or give them time to respond
  //   userResponseTimeoutRef.current = setTimeout(() => {
  //     if (waitingForUserResponse && !isUserSpeakingRef.current) {
  //       console.log('User not responding, moving to next question')
  //       moveToNextQuestion()
  //     }
  //   }, 8000) // Give user 8 seconds to start speaking after AI finishes
  // }

  const moveToNextQuestion = () => {
    console.log('moveToNextQuestion called')
    setCurrentQuestionIndex(prevIndex => {
      const nextIndex = prevIndex + 1
      console.log('Moving to next question, current index:', prevIndex, 'next index:', nextIndex, 'total questions:', interviewQuestions.length)
      
      // Get the current questions from ref
      const currentQuestions = interviewQuestionsRef.current
      console.log('Current questions array length:', currentQuestions.length)
      
      if (nextIndex < currentQuestions.length) {
        // Use askQuestionWithQuestions to ensure proper state management
        console.log('Asking next question:', nextIndex)
        askQuestionWithQuestions(nextIndex, currentQuestions)
      }
     else {
      console.log('Interview complete, calling completeInterview')
      completeInterview()
    }
  },800)
}

  const completeInterview = async () => {
    try {
      setIsLoading(true)
      setShowRecordingControls(false)
      
      // End the interview session
      const response = await axios.post(`/interview/ai/end/`,{
          conversation_id: conversationId
      })

      if (response.status === 200) {
        const result = await response.data
        
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
        waitingForUserResponseRef.current = false
        setIsInterviewStarted(false)
        isInterviewStartedRef.current = false
        
        // Speak completion message
        speakText('Thank you for completing the interview! Here is your evaluation summary.')
        
        // Show evaluation summary - make sure to set it properly
        if (result.summary) {
          console.log('Setting final evaluation:', result.summary)
          setAiEvaluation(result.summary)
        } else if (result.evaluation) {
          console.log('Setting final evaluation from evaluation field:', result.evaluation)
          setAiEvaluation(result.evaluation)
        } else {
          // Create a default evaluation if none provided
          const defaultEvaluation = {
            score: 'N/A',
            feedback: 'Interview completed successfully. Detailed evaluation will be available soon.'
          }
          setAiEvaluation(defaultEvaluation)
        }
      } else {
        console.error('Failed to end interview')
        // Show default completion even if API fails
        setIsInterviewStarted(false)
        isInterviewStartedRef.current = false
        const defaultEvaluation = {
          score: 'N/A',
          feedback: 'Interview completed. Evaluation processing...'
        }
        setAiEvaluation(defaultEvaluation)
      }
    } catch (error) {
      console.error('Error ending interview:', error)
      // Show completion even on error
      setIsInterviewStarted(false)
      isInterviewStartedRef.current = false
      const errorEvaluation = {
        score: 'N/A',
        feedback: 'Interview completed. There was an issue retrieving the evaluation.'
      }
      setAiEvaluation(errorEvaluation)
    } finally {
      setIsLoading(false)
      
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
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current)
      }
      if (userResponseTimeoutRef.current) {
        clearTimeout(userResponseTimeoutRef.current)
      }
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
      waitingForUserResponseRef.current = false
      aiFinishedSpeakingRef.current = false
      setIsListening(false)
    }
  }

  const startInterview = async () => {
    console.log('startInterview called with jobDescription:', jobDescription)
    if (!jobDescription.trim()) {
      alert('Please provide a job description to start the interview.')
      return
    }

    try {
      console.log('Starting AI interview session...')
      setIsLoading(true)
      
      // Start AI interview session
      const response = await axios.post(`/interview/ai/start/`, {
          job_description: jobDescription,
          user_resume_summary: userResumeSummary || 'Experienced professional seeking new opportunities',
          question_count: 5,
          difficulty: 'medium'
      })

      if (response.status === 200) {
        const result = await response.data
        console.log('API response received:', result)
        
        // Set all state immediately and synchronously
        setSessionId(result.session_id)
        setConversationId(result.conversation_id)
        setInterviewQuestions(result.questions)
        interviewQuestionsRef.current = result.questions
        setIsInterviewStarted(true)
        isInterviewStartedRef.current = true
        setCurrentQuestionIndex(0)
        setLastUserResponseTime(null)
        setFinalTranscription('')
        setWaitingForUserResponse(false)
        waitingForUserResponseRef.current = false
        setShowSetupForm(false)
        
        console.log('Interview questions set:', result.questions)
        
        // Start with a welcome message
        const welcomeMessage = {
          id: Date.now(),
          sender: 'AI Interviewer',
          text: 'Welcome to your AI-powered interview! I will ask you questions based on the job description you provided. Please use the recording controls to answer each question.',
          timestamp: new Date().toLocaleTimeString()
        }
        
        setMessages([welcomeMessage])
        
        // Start speech recognition first, then ask first question
        console.log('Starting speech recognition immediately')
        startSpeechRecognition()
        
        // Ask first question after a delay
        setTimeout(() => {
          console.log('Asking first question')
          askQuestionWithQuestions(0, result.questions)
        }, 2000)
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
    console.log('Starting speech recognition...')
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started')
      }
      
      recognitionRef.current.onresult = (event) => {
        console.log('Speech recognition result received:', {
          isAISpeaking,
          aiFinishedSpeaking: aiFinishedSpeakingRef.current,
          isListening,
          waitingForUserResponse,
          isAudioOn,
          timeSinceAISpeech: lastAISpeechTimeRef.current ? Date.now() - lastAISpeechTimeRef.current : 'N/A'
        })
        
        // Don't process speech recognition results if audio is muted
        if (!isAudioOn) {
          console.log('Ignoring speech recognition result - audio is muted')
          return
        }
        
        // Only check if AI is currently speaking (most important check)
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
          setLastUserResponseTime(Date.now())
          setLastUserSpeechTime(Date.now())
          
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
          
          // Check for filler words and respond
          const isFiller = detectFillerWords(finalTranscript)
          console.log('User said:', finalTranscript, 'Is filler?', isFiller)
          
          if (isFiller) {
            const hmmMessage = "Hmm, I understand. Please continue."
            console.log('Responding to filler words with:', hmmMessage)
            speakText(hmmMessage)
            
            const hmmChatMessage = {
              id: Date.now() + 1,
              sender: 'AI Interviewer',
              text: hmmMessage,
              timestamp: new Date().toLocaleTimeString(),
              type: 'encouragement'
            }
            setMessages(prev => [...prev, hmmChatMessage])
            
            // Continue listening after responding to filler words
            setTimeout(() => {
              console.log('Restarting listening after filler response')
              startListening()
            }, 2000)
          } else {
            // Process the user response only if it's not just filler words
            console.log('Processing user response:', finalTranscript)
            processUserResponse(finalTranscript.trim())
            
            // Restart listening after processing response
            setTimeout(() => {
              if (isInterviewStartedRef.current && !isAISpeaking && !isUserSpeakingRef.current) {
                console.log('Restarting listening after processing user response')
                startListening()
              }
            }, 1000)
          }
        }
      }
      
      recognitionRef.current.onspeechstart = () => {
        console.log('User started speaking')
        setIsUserSpeaking(true)
        isUserSpeakingRef.current = true
        setWaitingForUserResponse(false)
        responseStartTimeRef.current = Date.now()
        
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
        
        // Start silence timeout only when user stops speaking and we're waiting for response
        if (waitingForUserResponse) {
          console.log('Starting silence timeout after user stopped speaking')
          const timer = setTimeout(() => {
            console.log('User silence timeout after speech end - proceeding to next step')
            // Only proceed if user is still not speaking
            if (!isUserSpeakingRef.current && waitingForUserResponseRef.current) {
              handleSilenceTimeout()
            }
          }, 5000) // 5 second silence timeout
          
          setSilenceTimer(timer)
          console.log('Silence timer set for 5 seconds after user stopped speaking')
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsUserSpeaking(false)
        isUserSpeakingRef.current = false
      }
      
      recognitionRef.current.onend = () => {
        setIsUserSpeaking(false)
        isUserSpeakingRef.current = false
        
        // Only restart if we're actively recording and interview is active
        // Don't auto-restart when not in recording mode to prevent loops
        if (isRecording && isInterviewStartedRef.current && isCallActive) {
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                recognitionRef.current.start()
              } catch (error) {
                console.log('Failed to restart speech recognition:', error)
              }
            }
          }, 100)
        }
      }
      
      console.log('Speech recognition initialized')
    } else {
      console.log('Speech recognition not supported in this browser')
      alert('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
    }
  }

  const submitResponseToAI = async (userResponse) => {
    if (!conversationId || !currentQuestionData) {
      setIsProcessingResponse(false)
      return
    }

    try {
      const responseDuration = responseStartTimeRef.current ? 
        Math.round((Date.now() - responseStartTimeRef.current) / 1000) : 0

      const response = await axios.post(`/interview/ai/submit-response/`, {
          conversation_id: conversationId,
          question_text: currentQuestion,
          user_response: userResponse,
          question_data: currentQuestionData,
          response_duration: responseDuration
      })

      if (response.status === 200) {
        const result = await response.data
        
        // Don't show individual question evaluations, just store them
        console.log('Question evaluation received:', result.evaluation)
        
        // Add a simple confirmation message instead of showing evaluation
        const confirmationMessage = {
          id: Date.now() + 2 + Math.random(),
          sender: 'AI Interviewer',
          text: 'Thank you for your response. Moving to the next question.',
          timestamp: new Date().toLocaleTimeString(),
          type: 'confirmation'
        }
        
        setMessages(prev => [...prev, confirmationMessage])
        
        // Set follow-up question if available
        if (result.follow_up_question) {
          setFollowUpQuestion(result.follow_up_question)
        }
        
        // Move to next question after processing response
        console.log('Moving to next question after AI evaluation')
        setTimeout(() => {
          moveToNextQuestion()
        }, 1000)
      } else {
        console.error('Failed to submit response to AI')
        setIsProcessingResponse(false)
        setTimeout(() => {
          moveToNextQuestion()
        }, 1000)
      }
    } catch (error) {
      console.error('Error submitting response to AI:', error)
      setIsProcessingResponse(false)
      setTimeout(() => {
        moveToNextQuestion()
      }, 1000)
    }
  }

  const askQuestionWithQuestions = (questionIndex, questions) => {
    console.log('Asking question with questions:', questionIndex, 'of', questions.length)
    if (questionIndex < questions.length) {
      setCurrentQuestionIndex(questionIndex)
      const question = questions[questionIndex]
      console.log('Current question:', question.question_text)
      setCurrentQuestion(question.question_text)
      setCurrentQuestionData(question)
      setWaitingForUserResponse(true) // Set this to true so AI knows to start listening
      waitingForUserResponseRef.current = true // Also set the ref for immediate access
      
      const aiMessage = {
        id: Date.now(),
        sender: 'AI Interviewer',
        text: question.question_text,
        timestamp: new Date().toLocaleTimeString(),
        questionData: question
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // Clear any existing timeouts
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current)
      }
      if (userResponseTimeoutRef.current) {
        clearTimeout(userResponseTimeoutRef.current)
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
      
      // Speak the question out loud
      console.log('Speaking question:', question.question_text)
      speakText(question.question_text)
      
      // The speakText function will handle starting listening after AI finishes speaking
    } else {
      console.log('Cannot ask question - index out of range')
    }
    
    // Clear all states for new question
    setShowRecordingControls(false)
    setIsRecording(false)
    setCurrentTranscription('')
    setFinalTranscription('')
    setCurrentQuestionSpoken(false)
    
    const question = questions[questionIndex]
    setCurrentQuestionIndex(questionIndex)
    setCurrentQuestion(question.question_text)
    setCurrentQuestionData(question)
    setWaitingForUserResponse(true)
    waitingForUserResponseRef.current = true
    
    // Add question message to chat (only once)
    const aiMessage = {
      id: Date.now() + Math.random(), // Ensure unique ID
      sender: 'AI Interviewer',
      text: question.question_text,
      timestamp: new Date().toLocaleTimeString(),
      questionData: question
    }
    
    setMessages(prev => [...prev, aiMessage])
    
    // Clear any existing timeouts
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current)
      questionTimeoutRef.current = null
    }
    if (userResponseTimeoutRef.current) {
      clearTimeout(userResponseTimeoutRef.current)
      userResponseTimeoutRef.current = null
    }
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
    }
    
    // Speak the question
    console.log('Speaking question:', questionIndex)
    speakText(question.question_text)
  }

  useEffect(() => {
    // Initialize speech synthesis voices
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices()
      
      // Some browsers need this event to load voices properly
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
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current)
      }
      if (userResponseTimeoutRef.current) {
        clearTimeout(userResponseTimeoutRef.current)
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer)
      }
      if (userSpeakingTimer) {
        clearTimeout(userSpeakingTimer)
      }
      // Stop any ongoing speech when component unmounts
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
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Interview Setup
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  Setup Required
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Setup Form */}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Resume Summary (Optional)
                </label>
                <textarea
                  value={userResumeSummary}
                  onChange={(e) => setUserResumeSummary(e.target.value)}
                  placeholder="Brief summary of your background, skills, and experience..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex gap-4">
              <button
                onClick={handleStartInterview}
                disabled={!jobDescription.trim() || isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up...' : 'Start Interview'}
              </button>
              </div>
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
              
              {/* Enhanced Recording Controls Overlay */}
              {showRecordingControls && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-blue-900/80 to-purple-900/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="relative">
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-20 animate-pulse blur-lg"></div>
                    
                    {/* Main card */}
                    <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl border border-white/20">
                      {!isRecording ? (
                        <>
                          {/* Microphone icon with animated rings */}
                          <div className="relative mb-6">
                            <div className="absolute inset-0 animate-ping">
                              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 mx-auto"></div>
                            </div>
                            <div className="absolute inset-2 animate-pulse delay-75">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 mx-auto"></div>
                            </div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                              </svg>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                              Ready to Record?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              Take your time to think, then click the button below to start recording your response
                            </p>
                          </div>
                          
                          {/* Start Recording Button */}
                          <button
                            onClick={startRecording}
                            className="group relative w-full overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                          >
                            {/* Button background animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Button content */}
                            <div className="relative flex items-center justify-center gap-3">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                              </div>
                              <span className="text-lg">Start Recording</span>
                            </div>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Recording in progress */}
                          <div className="relative mb-6">
                            {/* Pulsing red recording indicator */}
                            <div className="absolute inset-0">
                              <div className="w-20 h-20 bg-red-500 rounded-full opacity-20 animate-ping mx-auto"></div>
                            </div>
                            <div className="absolute inset-2">
                              <div className="w-16 h-16 bg-red-500 rounded-full opacity-30 animate-pulse mx-auto"></div>
                            </div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <h3 className="text-xl font-bold text-red-600">Recording in Progress</h3>
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-75"></div>
                            </div>
                            <p className="text-gray-600 text-sm">Speak clearly and naturally</p>
                          </div>
                          
                          {/* Live transcription display */}
                          {(currentTranscription || finalTranscription) && (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 max-h-32 overflow-y-auto border border-gray-200">
                              <div className="text-left">
                                {finalTranscription && (
                                  <p className="text-gray-800 text-sm leading-relaxed">
                                    {finalTranscription}
                                  </p>
                                )}
                                {currentTranscription && (
                                  <p className="text-blue-600 text-sm italic mt-1">
                                    {currentTranscription}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Stop Recording Button */}
                          <button
                            onClick={stopRecording}
                            className="group relative w-full overflow-hidden bg-gradient-to-r from-red-500 via-red-500 to-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                          >
                            {/* Button background animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Button content */}
                            <div className="relative flex items-center justify-center gap-3">
                              <div className="w-6 h-6 bg-white/20 rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                              </div>
                              <span className="text-lg">Stop Recording</span>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
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
                  {showRecordingControls && (
                    <div className="mt-2 flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">Ready to record your answer</span>
                    </div>
                  )}
                  {isRecording && (
                    <div className="mt-2 flex items-center gap-2 text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">Recording in progress...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Recording Status */}
              {showRecordingControls && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Recording Controls</h4>
                  <p className="text-orange-800 text-sm">
                    {isRecording ? 'Recording your response...' : 'Click "Start Recording" in the video area to begin'}
                  </p>
                </div>
              )}

              {/* Live Transcription */}
              {isRecording && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Live Transcription</h4>
                  {finalTranscription && (
                    <div className="bg-white p-3 rounded border mb-2">
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
                      Speak your answer...
                    </div>
                  )}
                </div>
              )}

              {/* AI Evaluation - Only show final evaluation at end of interview */}
              {aiEvaluation && !isInterviewStarted && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Final Interview Evaluation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Overall Score:</span>
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
                        : message.type === 'error'
                        ? 'bg-red-100 mr-4'
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
