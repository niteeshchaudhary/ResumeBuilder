import { Fragment, useContext } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { companyLogo } from '../assets/Images';
import Inbox  from './Inbox';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useFeatureFeedback } from '../hooks/useFeatureFeedback';

const host = import.meta.env.VITE_HOST;

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { authState, refreshToken, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { triggerImmediateFeedback } = useFeatureFeedback();
  const navigation = [
    { name: 'Dashboard', href: '/u/', current: true },
    // { name: 'Team', href: '#', current: false },
    // { name: 'Projects', href: '#', current: false },
    // { name: 'Pricing', href: authState.isEnterprise?'/e/pricing':'/u/pricing', current: true },
    { name: 'Transactions', href: '/u/transactions', current: true },
  ]
  const navigator = useNavigate();
  const isAuthenticated = authState.isAuthenticated;

  return (
    <Disclosure as="nav" className="bg-gray-800 dark:bg-gray-900">
      {({ open }) => (
        <>
          <div className="w-full px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <Link to="/u/" className="flex flex-shrink-0 items-center">
                  <img src={companyLogo} alt="Company Logo" className="h-8 w-8" />
                </Link>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => navigator(item.href)}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Profile dropdown */}
              {isAuthenticated ? (
                <>
                  <div className="inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {/* Notification button */}

                    <div
                      className="rounded-full bg-gray-800 p-1 mr-3 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <Inbox userId={authState?.userDetails?.email} />

                    </div>
                    <button
                      onClick={toggleTheme}
                      className="mr-3 rounded-md border border-gray-600 p-2 text-gray-100 hover:bg-gray-800 transition-colors"
                    >
                      {theme === 'dark' ? (
                        <SunIcon className="h-5 w-5" aria-label="Switch to light mode" />
                      ) : (
                        <MoonIcon className="h-5 w-5" aria-label="Switch to dark mode" />
                      )}
                    </button>
                    

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={`${host}/reserish${authState?.userDetails?.profile_picture}`}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ focus }) => (
                              <span
                                onClick={() => {
                                  navigator('/u/profile');
                                }}
                                className={classNames(focus ? 'bg-gray-100 dark:bg-gray-700' : '', 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:text-blue-700')}
                                style={{ cursor: 'pointer', fontWeight: '600' }}
                              >
                                Profile
                              </span>
                            )}
                          </Menu.Item>
                          
                          {/* Feedback Button */}
                          <Menu.Item>
                            {({ focus }) => (
                              <span
                                onClick={() => {
                                  triggerImmediateFeedback("General Feedback");
                                }}
                                className={classNames(focus ? 'bg-gray-100 dark:bg-gray-700' : '', 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:text-blue-700')}
                                style={{ cursor: 'pointer', fontWeight: '600' }}
                              >
                                <ChatBubbleLeftRightIcon className="inline-block w-4 h-4 mr-2" />
                                Give Feedback
                              </span>
                            )}
                          </Menu.Item>
                          
                          <Menu.Item>
                            {({ focus }) => (
                              <span
                                onClick={() => {
                                  logout();
                                  navigator('/');
                                }}
                                className={classNames(focus ? 'bg-gray-100 dark:bg-gray-700' : '', 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:text-blue-700')}
                                style={{ cursor: 'pointer', fontWeight: '600' }}
                              >
                                Sign out
                              </span>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </>
              ) : (<>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <button
                    onClick={toggleTheme}
                    className="mr-3 rounded-md border border-gray-600 p-2 text-gray-100 hover:bg-gray-800 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" aria-label="Switch to light mode" />
                    ) : (
                      <MoonIcon className="h-5 w-5" aria-label="Switch to dark mode" />
                    )}
                  </button>
                  <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Login</a>
                </div>

              </>)}

            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}