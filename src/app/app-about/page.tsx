import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AkodeIslamicCentrePage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            {/* Main Content */}
            <div className="flex flex-col px-5 py-4 space-y-5 mt-4">
                {/* Logo and Title */}
                <div className="flex items-center justify-center space-x-3">
                    <div className="w-56 flex-shrink-0">
                        {/* Logo placeholder - replace with your actual logo component */}
                        <div className="flex items-center justify-center">
                            {/* Replaced img with Image component */}
                            <Image
                                src="/images/aic-logo-01.png"
                                alt="Akode Islamic Centre Logo"
                                width={224}
                                height={224}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Information Cards */}
                <div className='w-full px-4 max-w-4xl mx-auto space-y-6'>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* First Video Card */}
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative pt-[56.25%] w-full">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src="https://www.youtube.com/embed/rlcfa2S5e7A"
                                    title="Akode Islamic Centre Overview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">AIC 23rd Annual Conference Day 1</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Highlights from our latest annual conference showcasing community achievements and initiatives</p>
                            </div>
                        </div>

                        {/* Second Video Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative pt-[56.25%] w-full">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src="https://www.youtube.com/embed/2BG-uP5PT4A"
                                    title="Akode Islamic Centre Grand Nikkah Function"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Blessed Presence of Our Spiritual Leaders</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Highlights from the Day 2 of AIC 23rd Annual Conference & Grand Nikkah Ceremony</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media/Information Links */}
                <div className="space-y-3">
                    <Link className="flex items-center justify-center space-x-3" href="http://www.youtube.com/@akodeislamiccentre">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            {/* YouTube Icon */}
                            <svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.4 22.8571L30.337 16L18.4 9.14286V22.8571ZM44.988 4.96C45.287 6.03429 45.494 7.47429 45.632 9.30286C45.793 11.1314 45.862 12.7086 45.862 14.08L46 16C46 21.0057 45.632 24.6857 44.988 27.04C44.413 29.0971 43.079 30.4229 41.009 30.9943C39.928 31.2914 37.95 31.4971 34.914 31.6343C31.924 31.7943 29.187 31.8629 26.657 31.8629L23 32C13.363 32 7.36 31.6343 4.991 30.9943C2.921 30.4229 1.587 29.0971 1.012 27.04C0.713 25.9657 0.506 24.5257 0.368 22.6971C0.207 20.8686 0.138 19.2914 0.138 17.92L0 16C0 10.9943 0.368 7.31429 1.012 4.96C1.587 2.90286 2.921 1.57714 4.991 1.00571C6.072 0.708572 8.05 0.502857 11.086 0.365714C14.076 0.205714 16.813 0.137143 19.343 0.137143L23 0C32.637 0 38.64 0.365714 41.009 1.00571C43.079 1.57714 44.413 2.90286 44.988 4.96Z" fill="#AAA5FC" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Know</p>
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">AKODE ISLAMIC CENTRE</p>
                        </div>
                    </Link>

                    <Link className="flex items-center justify-center space-x-3" href="https://aicamal.app/about">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            {/* Globe Icon */}
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.976 19.2C23.104 18.144 23.2 17.088 23.2 16C23.2 14.912 23.104 13.856 22.976 12.8H28.384C28.64 13.824 28.8 14.896 28.8 16C28.8 17.104 28.64 18.176 28.384 19.2M20.144 28.096C21.104 26.32 21.84 24.4 22.352 22.4H27.072C25.5219 25.0692 23.0626 27.0912 20.144 28.096ZM19.744 19.2H12.256C12.096 18.144 12 17.088 12 16C12 14.912 12.096 13.84 12.256 12.8H19.744C19.888 13.84 20 14.912 20 16C20 17.088 19.888 18.144 19.744 19.2ZM16 28.736C14.672 26.816 13.6 24.688 12.944 22.4H19.056C18.4 24.688 17.328 26.816 16 28.736ZM9.6 9.6H4.928C6.46183 6.92325 8.91945 4.89799 11.84 3.904C10.88 5.68 10.16 7.6 9.6 9.6ZM4.928 22.4H9.6C10.16 24.4 10.88 26.32 11.84 28.096C8.92523 27.0917 6.47086 25.0691 4.928 22.4ZM3.616 19.2C3.36 18.176 3.2 17.104 3.2 16C3.2 14.896 3.36 13.824 3.616 12.8H9.024C8.896 13.856 8.8 14.912 8.8 16C8.8 17.088 8.896 18.144 9.024 19.2M16 3.248C17.328 5.168 18.4 7.312 19.056 9.6H12.944C13.6 7.312 14.672 5.168 16 3.248ZM27.072 9.6H22.352C21.8505 7.61858 21.109 5.70577 20.144 3.904C23.088 4.912 25.536 6.944 27.072 9.6ZM16 0C7.152 0 0 7.2 0 16C0 20.2435 1.68571 24.3131 4.68629 27.3137C6.17203 28.7994 7.93586 29.978 9.87706 30.7821C11.8183 31.5861 13.8989 32 16 32C20.2435 32 24.3131 30.3143 27.3137 27.3137C30.3143 24.3131 32 20.2435 32 16C32 13.8989 31.5861 11.8183 30.7821 9.87706C29.978 7.93586 28.7994 6.17203 27.3137 4.68629C25.828 3.20055 24.0641 2.022 22.1229 1.21793C20.1817 0.413852 18.1012 0 16 0Z" fill="#AAA5FC" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">More about</p>
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">AIC AMAL APP</p>
                        </div>
                    </Link>

                    <Link className="flex items-center justify-center space-x-3" href="https://aicedu.in/about/">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            {/* Info Icon */}
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 0C7.168 0 0 7.168 0 16C0 24.832 7.168 32 16 32C24.832 32 32 24.832 32 16C32 7.168 24.832 0 16 0ZM16 24C14.9391 24 14 23.0609 14 22V16C14 14.9391 14.9391 14 16 14C17.0609 14 18 14.9391 18 16V22C18 23.0609 17.0609 24 16 24ZM16 12C14.9391 12 14 11.0609 14 10C14 8.93909 14.9391 8 16 8C17.0609 8 18 8.93909 18 10C18 11.0609 17.0609 12 16 12Z" fill="#AAA5FC" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Learn about</p>
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">AKODE ISLAMIC CENTRE</p>
                        </div>
                    </Link>
                </div>

                {/* Contact Buttons */}
                <div className="w-full flex justify-center py-6 md:py-8">
                    <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 px-4 w-full max-w-3xl overflow-x-auto">
                        <a href="https://www.whatsapp.com/channel/0029VaGf3bGDOQIW6U8X4u2K" target="_blank" rel="noopener noreferrer" className="w-20 sm:w-24 md:w-28 py-3 bg-white dark:bg-gray-800 rounded-lg border border-[#AAA5FC] dark:border-[#AAA5FC]/60 flex flex-col items-center shrink-0">
                            {/* WhatsApp Icon */}
                            <svg width="32" height="32" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.809 0.421356C32.0536 0.421356 41.1686 9.53632 41.1686 20.7809C41.1686 32.0255 32.0536 41.1404 20.809 41.1404C17.211 41.1466 13.6762 40.1944 10.5682 38.3817L0.457638 41.1404L3.21025 31.0258C1.39613 27.9168 0.443189 24.3805 0.449494 20.7809C0.449494 9.53632 9.56446 0.421356 20.809 0.421356ZM13.8705 11.2119L13.4633 11.2282C13.2 11.2463 12.9428 11.3155 12.7059 11.4318C12.4852 11.557 12.2836 11.7134 12.1074 11.896C11.8631 12.1261 11.7246 12.3256 11.576 12.519C10.8229 13.4981 10.4175 14.7001 10.4236 15.9353C10.4277 16.9329 10.6883 17.9041 11.0955 18.8121C11.9282 20.6486 13.2984 22.5929 15.1063 24.3947C15.542 24.8284 15.9696 25.2641 16.4297 25.6692C18.6762 27.6469 21.3532 29.0733 24.2478 29.8348L25.4042 30.0119C25.7808 30.0323 26.1575 30.0038 26.5362 29.9854C27.129 29.9542 27.7078 29.7937 28.2321 29.5151C28.4985 29.3774 28.7587 29.2279 29.0119 29.0672C29.0119 29.0672 29.0981 29.0089 29.2664 28.884C29.5412 28.6804 29.7102 28.5358 29.9382 28.2976C30.1093 28.1212 30.2518 27.9162 30.3658 27.6828C30.5246 27.3509 30.6834 26.7177 30.7486 26.1904C30.7974 25.7873 30.7832 25.5674 30.7771 25.431C30.7689 25.2132 30.5877 24.9872 30.3902 24.8915L29.2053 24.3601C29.2053 24.3601 27.434 23.5885 26.3509 23.0958C26.2375 23.0464 26.1161 23.0181 25.9926 23.0123C25.8533 22.9977 25.7124 23.0133 25.5797 23.0579C25.4469 23.1025 25.3252 23.1751 25.223 23.2709C25.2128 23.2668 25.0764 23.3828 23.6044 25.1663C23.5199 25.2799 23.4035 25.3657 23.2701 25.4128C23.1367 25.4599 22.9922 25.4663 22.8552 25.431C22.7225 25.3956 22.5925 25.3507 22.4663 25.2966C22.2138 25.1908 22.1263 25.15 21.9532 25.0768C20.7843 24.5676 19.7024 23.8785 18.7466 23.0347C18.4901 22.8107 18.2519 22.5664 18.0076 22.3303C17.2066 21.5631 16.5086 20.6954 15.9309 19.7487L15.8108 19.5552C15.7258 19.4245 15.6561 19.2845 15.6031 19.1379C15.5257 18.8386 15.7273 18.5984 15.7273 18.5984C15.7273 18.5984 16.222 18.0568 16.4521 17.7636C16.676 17.4786 16.8654 17.2017 16.9875 17.0042C17.2278 16.6174 17.3031 16.2204 17.1769 15.9129C16.6068 14.5203 16.0178 13.1352 15.4097 11.7575C15.2896 11.4847 14.9333 11.2893 14.6096 11.2506C14.4996 11.237 14.3897 11.2262 14.2797 11.218C14.0064 11.2023 13.7322 11.2051 13.4592 11.2262L13.8705 11.2119Z" fill="#3730A3" />
                            </svg>
                            <p className="text-xs sm:text-sm font-medium mt-1.5 text-gray-900 dark:text-gray-100">WhatsApp</p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Community</p>
                        </a>

                        <a href="https://wa.me/+919745833399" target="_blank" rel="noopener noreferrer" className="w-20 sm:w-24 md:w-28 py-3 bg-white dark:bg-gray-800 rounded-lg border border-[#AAA5FC] dark:border-[#AAA5FC]/60 flex flex-col items-center shrink-0">
                            {/* Chat Icon */}
                            <svg width="24" height="32" className="w-6 h-8 sm:w-7 sm:h-9 md:w-8 md:h-10" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.3498 28.8712L11.3468 28.8625L10.7665 28.6822C8.00687 27.7531 5.5857 26.0882 3.79135 23.8856C2.34038 22.1059 1.34339 20.0295 0.879021 17.8201C0.414651 15.6107 0.495603 13.3288 1.11549 11.1543C1.73538 8.97974 2.87725 6.97216 4.45103 5.28985C6.02481 3.60755 7.98746 2.29654 10.1842 1.46023C12.3809 0.623922 14.7515 0.285195 17.1092 0.470766C19.4668 0.656338 21.747 1.36113 23.7697 2.52955C25.7925 3.69798 27.5026 5.29807 28.7651 7.20362C30.0276 9.10917 30.8079 11.2681 31.0446 13.51C31.1271 14.3099 30.4339 14.9615 29.591 14.9615C28.7481 14.9615 28.0732 14.307 27.9724 13.51C27.6998 11.453 26.8551 9.50273 25.5257 7.86099C24.1963 6.21925 22.4305 4.94568 20.4109 4.17206C18.3914 3.39843 16.1914 3.15286 14.0388 3.46074C11.8861 3.76862 9.85898 4.61877 8.16704 5.92324C6.4751 7.2277 5.17985 8.93908 4.41531 10.8803C3.65078 12.8215 3.44473 14.9221 3.81848 16.9646C4.19223 19.0071 5.13222 20.9174 6.54117 22.4978C7.95012 24.0782 9.77685 25.2714 11.8324 25.9537C12.3508 25.053 13.1863 24.3554 14.1918 23.9838C15.1972 23.6121 16.308 23.5903 17.3287 23.922C18.3494 24.2538 19.2144 24.918 19.7715 25.7975C20.3286 26.677 20.542 27.7156 20.3742 28.7303C20.2064 29.745 19.6681 30.6708 18.8541 31.3446C18.0401 32.0184 17.0026 32.3971 15.9242 32.4139C14.8459 32.4308 13.7959 32.0847 12.9591 31.4367C12.1224 30.7886 11.5525 29.8802 11.3498 28.8712ZM8.92807 31.1255C5.93706 29.9625 3.32208 28.0668 1.3482 25.6309C0.84649 26.3475 0.578712 27.1896 0.578613 28.051V29.5054C0.578613 35.2385 6.25893 41.1405 15.8483 41.1405C25.4376 41.1405 31.1179 35.2385 31.1179 29.5054V28.051C31.1179 26.8938 30.6353 25.784 29.7762 24.9657C28.9171 24.1475 27.752 23.6878 26.537 23.6878H21.9561C22.5967 24.5026 23.0505 25.4364 23.2882 26.4287C23.5259 27.4211 23.5423 28.4499 23.3362 29.4487C23.1301 30.4475 22.7062 31.3939 22.0919 32.2268C21.4775 33.0597 20.6865 33.7604 19.7698 34.2837C18.8532 34.807 17.8315 35.1412 16.7707 35.2647C15.7099 35.3881 14.6337 35.2981 13.6118 35.0004C12.5899 34.7027 11.6449 34.204 10.8381 33.5365C10.0313 32.869 9.38057 32.0477 8.92807 31.1255ZM25.0101 14.9615C25.0101 12.3028 23.761 9.92056 21.7912 8.32073C20.8295 7.54481 19.71 6.96624 18.5027 6.62122C17.2955 6.2762 16.0265 6.17214 14.7751 6.31556C13.5238 6.45898 12.3169 6.84678 11.2301 7.45472C10.1432 8.06266 9.19977 8.87765 8.45871 9.84872C7.71766 10.8198 7.19493 11.9261 6.92324 13.0983C6.65154 14.2706 6.63672 15.4837 6.87971 16.6617C7.12269 17.8396 7.61824 18.9572 8.33538 19.9444C9.05251 20.9317 9.9758 21.7674 11.0475 22.3992C12.4055 21.3506 14.1001 20.7777 15.8483 20.7761C17.5957 20.776 19.2903 21.3469 20.6491 22.3934C21.9818 21.6124 23.0823 20.5194 23.8457 19.2184C24.6091 17.9174 25.010 16.4519 25.0101 14.9615Z" fill="#3730A3" />
                            </svg>
                            <p className="text-xs sm:text-sm font-medium mt-1.5 text-gray-900 dark:text-gray-100">Chat</p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Support</p>
                        </a>

                        <a href="mailto:hello@aicamal.app" className="w-20 sm:w-24 md:w-28 py-3 bg-white dark:bg-gray-800 rounded-lg border border-[#AAA5FC] dark:border-[#AAA5FC]/60 flex flex-col items-center shrink-0">
                            {/* Mail Icon */}
                            <svg width="40" height="28" className="w-9 h-7 sm:w-10 sm:h-8 md:w-11 md:h-9" viewBox="0 0 55 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 15.3613V30.75C0 33.4685 1.08649 36.0756 3.02046 37.9978C4.95443 39.9201 7.57746 41 10.3125 41H44.6875C47.4225 41 50.0456 39.9201 51.9795 37.9978C53.9135 36.0756 55 33.4685 55 30.75V15.3613L28.9094 27.0327C28.4662 27.2307 27.9859 27.333 27.5 27.333C27.0141 27.333 26.5338 27.2307 26.0906 27.0327L0 15.3613ZM0.254375 7.98134L27.5 20.172L54.7456 7.98134C54.228 5.71455 52.9506 3.68994 51.123 2.23969C49.2954 0.789441 47.0261 -0.000313979 44.6875 9.36401e-08H10.3125C7.97389 -0.000313979 5.70461 0.789441 3.877 2.23969C2.04939 3.68994 0.771987 5.71455 0.254375 7.98134Z" fill="#3730A3" />
                            </svg>
                            <p className="text-xs sm:text-sm font-medium mt-1.5 text-gray-900 dark:text-gray-100">Mail</p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Support</p>
                        </a>
                    </div>
                </div>

                {/* Description Section */}
                <div className="w-full px-4 max-w-4xl mx-auto mt-4 mb-12">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-5 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">About Akode Islamic Centre</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            The Akode Islamic Centre is a beacon of compassion and knowledge, providing a foster life and a brighter future for <strong>over 400 orphaned children.</strong> In addition to providing essential support such as education, health care, and basic needs, we ensure that these children feel a loving family environment that warms the innocent story of childhood.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            As a center of knowledge that spans from kindergarten to post-secondary education, we are dedicated to empowering every individual through education, preserving cherished values and encouraging personal growth.
                        </p>
                    </div>
                </div>
                
                {/* Extra bottom padding */}
                <div className="pb-8"></div>
            </div>
        </div>
    );
};

export default AkodeIslamicCentrePage;