import { motion } from "framer-motion";
import OurPartners from "../components/OurPartners";
import Footer from "../components/Footer";
import OurLeaders from "../components/OurLeaders";
import Reviews from "../components/Reviews";
import Nav2 from "../components/Nav2";
import { resumeimage } from "../assets/Images";
import {
  SparklesIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  BoltIcon,
  PresentationChartLineIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-gradient-to-tr from-[#ff80b500] to-[#9089fc50] dark:bg-gray-950">
      <Nav2 />

      {/* Hero Section */}
      <div className="relative isolate px-6 lg:px-8 pt-24 lg:pt-32 min-h-screen flex items-center">
        <div
          className="absolute inset-x-0 -top-5 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] w-[36.125rem] rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] dark:from-purple-700 dark:to-fuchsia-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mx-auto  w-full"
        >
          <div className="relative isolate overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20 px-8 pt-20 pb-16 shadow-2xl sm:rounded-3xl sm:px-20 md:pt-24 lg:flex lg:gap-x-24 lg:px-28 lg:pt-0 lg:pb-20">
            {/* Light theme radial background */}
            <svg
              className="block dark:hidden absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>

            {/* Dark theme radial background (purple hues) */}
            <svg
              className="hidden dark:block absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#gradientDark)"
                fillOpacity="0.6"
              />
              <defs>
                <radialGradient id="gradientDark">
                  <stop stopColor="#7c3aed" />
                  <stop offset={1} stopColor="#a21caf" />
                </radialGradient>
              </defs>
            </svg>

            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 text-sm font-medium text-purple-800 dark:text-purple-200 mb-6"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                AI-Powered Resume Building
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl lg:text-7xl"
              >
                Transform Your
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Career Today
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-xl lg:max-w-none"
              >
                Create stunning, ATS-friendly resumes in minutes with our AI-powered platform. 
                Stand out from the crowd and land your dream job with professional templates and smart suggestions.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start"
              >
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Resumes Created</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">ATS Success Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">AI Support</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 lg:justify-start"
              >
                <a
                  href="/u/login"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:from-purple-700 hover:to-pink-700"
                >
                  Start Building Now
                  <RocketLaunchIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
                <a
                  href="/features"
                  className="group inline-flex items-center px-6 py-4 text-lg font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors duration-200"
                >
                  Watch Demo
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mt-12 flex items-center justify-center gap-6 lg:justify-start"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-red-500 border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trusted by 10K+ professionals</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="relative mt-16 lg:mt-8 lg:flex-1 lg:flex lg:items-center lg:justify-center"
            >
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
              
              <div className="relative w-full max-w-4xl lg:max-w-5xl">
                {/* Main Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* AI Analysis Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI-Powered Analysis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Smart suggestions & optimization</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Keyword optimization</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">ATS compatibility check</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Content enhancement</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Templates Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Professional Templates</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Modern & recruiter-approved</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">20+ premium designs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Industry-specific layouts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Customizable styling</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Interactive Demo Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                  className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/30 shadow-lg"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">See It In Action</h3>
                    <p className="text-gray-600 dark:text-gray-400">Experience the power of AI-driven resume building</p>
                  </div>
                  
                  {/* Mock Resume Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-inner border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">JD</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Rahul</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Software Engineer</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">9.4/10</div>
                        <div className="text-xs text-gray-500">ATS Score</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                      <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-4/5"></div>
                      <div className="h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-3/4"></div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center">
                      <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>AI Analysis Complete</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                  className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Analysis Complete</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Score: 9.4/10</div>
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                  className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                >
                  ✨ New AI Features
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* How it works */}
      <section className="mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">How it works</h3>
          <p className="mt-3 text-gray-600 dark:text-gray-300">A simple, guided flow from upload to job‑ready resume.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                <ClipboardDocumentListIcon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">1. Upload</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Drop your resume or paste details. We parse everything cleanly.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">2. Enhance</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">AI suggests bullet points, skills, and achievements tailored to roles.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                <WrenchScrewdriverIcon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">3. Customize</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Pick templates, reorder sections, and fine‑tune wording with instant previews.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                <RocketLaunchIcon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">4. Apply</h4>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Export ATS‑friendly PDFs and track applications in one place.</p>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto px-6 lg:px-8 pb-8">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Why choose Resume Upgrader</h3>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Built to help you stand out and save time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[{
            title: 'ATS‑friendly output',
            icon: ShieldCheckIcon,
            desc: 'Clean structure and keywords to pass Applicant Tracking Systems.'
          },{
            title: 'Role‑aware suggestions',
            icon: BoltIcon,
            desc: 'Instant bullet points tailored to job descriptions and domains.'
          },{
            title: 'Actionable insights',
            icon: PresentationChartLineIcon,
            desc: 'Quality checks with clear guidance to raise your score.'
          },{
            title: 'Beautiful templates',
            icon: SparklesIcon,
            desc: 'Modern, recruiter‑approved layouts with quick styling.'
          },{
            title: 'Privacy‑first',
            icon: ShieldCheckIcon,
            desc: 'Your data stays encrypted with granular control over sharing.'
          },{
            title: 'Human‑readable + AI‑strong',
            icon: ChatBubbleBottomCenterTextIcon,
            desc: 'Balanced writing that reads naturally and ranks better.'
          }].map(({ title, icon: Icon, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted by */}
      {/* <section className="mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200">Trusted by learners and professionals from top organizations</h3>
        </div>
        <OurPartners />
      </section> */}

      {/* Sections below with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Reviews />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <OurLeaders />
      </motion.div>

      {/* FAQ */}
      <section className="mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Frequently asked questions</h3>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Quick answers about the platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{
            q: 'Is my resume data private?',
            a: 'Yes. We use secure storage and never share your data without permission.'
          },{
            q: 'Will my resume pass ATS?',
            a: 'Our output follows ATS‑friendly formatting and keyword guidance.'
          },{
            q: 'Can I tailor to multiple roles?',
            a: 'Create role‑specific versions quickly by importing job descriptions.'
          },{
            q: 'Do you offer templates?',
            a: 'Yes. Multiple modern templates with easy styling and instant previews.'
          }].map(({ q, a }) => (
            <div key={q} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                  <QuestionMarkCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{q}</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-10 text-white shadow-lg">
          <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(500px_300px_at_10%_10%,white,transparent)]" />
          <div className="relative">
            <h3 className="text-2xl font-extrabold">Get job‑ready faster</h3>
            <p className="mt-2 text-sm text-purple-100">Build, enhance, and track your resumes in one place. Free to start.</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href="/u/login" className="rounded-xl bg-white/90 text-purple-700 px-5 py-3 text-sm font-semibold shadow-md hover:bg-white">
                Start for free
              </a>
              <a href="/features" className="text-sm font-semibold text-white/90 hover:text-white">
                Explore features →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
