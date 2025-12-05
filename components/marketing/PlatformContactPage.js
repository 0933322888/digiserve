'use client'

import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function PlatformContactPage() {
    return (
        <MarketingLayout>
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in touch</h1>
                        <p className="text-xl text-gray-400">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div>
                            <div className="bg-[#111] p-8 rounded-2xl border border-white/10 mb-8">
                                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">Email</h4>
                                            <p className="text-gray-400">hello@digiserve.com</p>
                                            <p className="text-gray-400">support@digiserve.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">Phone</h4>
                                            <p className="text-gray-400">+1 (555) 123-4567</p>
                                            <p className="text-gray-500 text-sm mt-1">Mon-Fri from 8am to 5pm EST</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">Office</h4>
                                            <p className="text-gray-400">
                                                123 Tech Boulevard<br />
                                                Suite 400<br />
                                                San Francisco, CA 94105
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-[#111] p-8 rounded-2xl border border-white/10">
                            <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    )
}
