import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Switch } from '@headlessui/react'
import Footer from '../components/Footer'
import Nav2 from '../components/Nav2'
import { useNavigate } from "react-router-dom";
import { useTheme } from '../theme/ThemeContext';
import axios from 'axios';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BuildingOfficeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const host = import.meta.env.VITE_HOST;
export default function ContactSupport() {
  const [agreed, setAgreed] = useState(false)
  const [mailsending, setMailSending] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    country: 'IN',
    message: ''
  })
  const navigator = useNavigate();
  const { theme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreed) {
      alert('You must agree to the privacy policy.')
      return
    }
    setMailSending(true)
    try {
      const res = await axios.post(`${host}/reserish/api/contact-us/`, formData)

      if (res.status === 200) {
        alert('Message sent successfully!')
        setFormData({
          firstName: '', lastName: '', company: '', email: '',
          phone: '', country: 'IN', message: ''
        })
        setAgreed(false)
        setMailSending(false)
      } else {
        alert('Failed to send message.')
        setMailSending(false)
      }
    } catch (err) {
      console.error(err)
      alert('Error sending message.')
      setMailSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Nav2 />
      
      {/* Main Content */}
      <div className="pt-24">
        {/* Hero Section */}
        <div className="relative isolate px-6 py-16 sm:py-24 lg:px-8">
          {/* Background Shapes */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] dark:from-purple-700 dark:to-fuchsia-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse delay-2000"></div>

          {/* Header */}
          <div className="mx-auto max-w-4xl text-center mb-16">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-4 py-2 text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Let's Start a
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about our services? Need help with your resume? We're here to help you succeed in your career journey.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Contact Form */}
              <div className="relative">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-gray-700/30">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Send us a Message</h2>
                    <p className="text-gray-600 dark:text-gray-400">We'll get back to you within 24 hours</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* First Name */}
                      <div className="relative">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                            placeholder="Enter your first name" />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="relative">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                            placeholder="Enter your last name" />
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="relative">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Organisation Name 
                        {/* <span className="text-red-500">*</span> */}
                      </label>
                      <div className="relative">
                        <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input  type="text" name="company" value={formData.company} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                          placeholder="Enter your organisation name" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="email" name="email" value={formData.email} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                          placeholder="Enter your email address" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select name="country" value={formData.country} onChange={handleChange}
                          className="absolute left-10 top-1/2 transform -translate-y-1/2 w-16 h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1 pl-2 pr-6 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                          <option>IN</option>
                          <option>US</option>
                          <option>CA</option>
                          <option>EU</option>
                        </select>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                          className="w-full pl-32 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                          placeholder="Enter your phone number" />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea required name="message" rows="4" value={formData.message} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none" 
                        placeholder="Tell us how we can help you..." />
                    </div>

                    {/* Agreement Switch */}
                    <Switch.Group as="div" className="flex gap-x-4 items-center">
                      <Switch checked={agreed} onChange={setAgreed}
                        className={classNames(
                          agreed ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700',
                          'flex w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        )}>
                        <span className={classNames(
                          agreed ? 'translate-x-5' : 'translate-x-0',
                          'inline-block w-4 h-4 bg-white rounded-full transition-transform duration-200'
                        )} />
                      </Switch>
                      <Switch.Label className="text-sm text-gray-600 dark:text-gray-400">
                        By selecting this, you agree to our <a href="/privacypolicy" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">privacy policy</a>.
                      </Switch.Label>
                    </Switch.Group>

                    {/* Submit Button */}
                    {
                      mailsending ?
                      <>
                      <button type="button"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-not-allowed"
                        disabled>
                        <span className="flex items-center justify-center">
                          Sending...
                          <svg className="animate-spin ml-2 w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.364A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.574z"></path>
                          </svg>
                        </span>
                      </button>
                      </>
                      :
                      <button type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="flex items-center justify-center">
                          Send Message
                          <ArrowRightIcon className="ml-2 w-5 h-5" />
                        </span>
                      </button>
                    }
                  </form>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Quick Contact */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 dark:border-gray-700/30">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Get in Touch</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <EnvelopeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email</h4>
                        <a href="mailto:resumeupgrader.rn@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        resumeupgrader.rn@gmail.com 
                        {/* /support@resumeupgrader.in */}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Phone</h4>
                        <a href="tel:+918905936141" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          +91-8905936141
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Address</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Ward No. 35, Ujjain Tola, Bettiah, Bihar - 845438
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                  <h3 className="text-2xl font-bold mb-4">Company Information</h3>
                  <div className="space-y-3 text-indigo-100">
                    <p><strong>Business Name:</strong> QUANTUM RESERISH PRIVATE LIMITED</p>
                    <p><strong>Location:</strong> Bettiah, Bihar, India</p>
                    <p><strong>Service:</strong> AI-Powered Resume Building & Career Solutions</p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/30 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Response</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
