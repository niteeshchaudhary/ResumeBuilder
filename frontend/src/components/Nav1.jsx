import { useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ChevronDownIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from "react-router-dom";
import { companyLogo } from '../assets/Images';
import { Fragment } from 'react';
import { useTheme } from '../theme/ThemeContext.jsx';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/aboutus' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '#' },
  { name: 'Contact Us', href: '/support' },
]

export default function Nav1(props) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const getUrl = () => {
    const firstSegment = location.pathname.split('/')[1] || '';
    if (['u', 'e'].includes(firstSegment)) {
      return `/${firstSegment}`;
    }
    return '';
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 w-full">
        <nav className="flex items-center justify-between p-6 lg:px-8 bg-white/80 backdrop-blur dark:bg-gray-900/80" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Resume Upgrader</span>
              <img src={companyLogo} alt="Company Logo" className="h-8 w-8 " />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => {
              if (item.name === 'Pricing') {
                return (
                  <Menu key={item.name} as="div" className="relative">
                    <Menu.Button className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
                      Pricing
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </Menu.Button>
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
                          {({ active }) => (
                            <Link
                              to="/pricing"
                              className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                            >
                              User Plans
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/sponsorship"
                              className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                            >
                              Sponsorship
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/college-pricing"
                              className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                            >
                              College Plans
                            </Link>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                );
              }
              return (
                <Link key={item.name} to={item.href} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end gap-4">
            <button onClick={toggleTheme} className="rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" aria-label="Switch to light mode" />
              ) : (
                <MoonIcon className="h-5 w-5" aria-label="Switch to dark mode" />
              )}
            </button>

            {props?.isSignup || location.pathname.endsWith("/signup") ?
              <Link
                to={`${getUrl()}/login`}
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
              >
                Log in
              </Link> :
              <Link
                to={`${getUrl()}/signup`}
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
              >
                Sign Up
              </Link>
            }
          </div>
        </nav>
        <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Resume Upgrader</span>
                <img src={companyLogo} alt="Company Logo" className="h-8 w-auto rounded-full" />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => {
                    if (item.name === 'Pricing') {
                      return (
                        <div key={item.name} className="space-y-2">
                          <div className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                            Pricing
                          </div>
                          <div className="ml-4 space-y-1">
                            <Link
                              to="/pricing"
                              className="-mx-3 block rounded-lg px-3 py-2 text-sm font-semibold leading-7 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              User Plans
                            </Link>
                            <Link
                              to="/sponsorship"
                              className="-mx-3 block rounded-lg px-3 py-2 text-sm font-semibold leading-7 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              Sponsorship
                            </Link>
                            <Link
                              to="/college-pricing"
                              className="-mx-3 block rounded-lg px-3 py-2 text-sm font-semibold leading-7 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              College Plans
                            </Link>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="py-6 flex items-center justify-between">
                  <button onClick={toggleTheme} className="rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" aria-label="Switch to light mode" />
                    ) : (
                      <MoonIcon className="h-5 w-5" aria-label="Switch to dark mode" />
                    )}
                  </button>
                  {props?.isSignup || location.pathname.endsWith("/signup") ?
                    <Link
                      to={`${getUrl()}/login`}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Log in
                    </Link> :
                    <Link
                      to={`${getUrl()}/signup`}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Sign Up
                    </Link>
                  }
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </>
  )
}
