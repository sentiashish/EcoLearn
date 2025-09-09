import React, { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'general', name: '🌍 General Inquiry', icon: '💬' },
    { id: 'technical', name: '🔧 Technical Support', icon: '⚙️' },
    { id: 'content', name: '📚 Content Feedback', icon: '📖' },
    { id: 'partnership', name: '🤝 Partnership', icon: '🤝' },
    { id: 'bug', name: '🐛 Bug Report', icon: '🐞' }
  ];

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: '📧 Email Us',
      content: 'support@ecoquest.com',
      description: 'Get help from our eco-warriors!'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '💬 Live Chat',
      content: 'Available 24/7',
      description: 'Chat with our community guides'
    },
    {
      icon: PhoneIcon,
      title: '📞 Call Us',
      content: '+1 (555) ECO-QUEST',
      description: 'Speak with our support team'
    },
    {
      icon: MapPinIcon,
      title: '🌍 Visit Us',
      content: 'EcoQuest HQ, Green Valley',
      description: 'Our sustainable headquarters'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('🎉 Message sent successfully! Our eco-team will get back to you soon!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      toast.error('❌ Failed to send message. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🌱 Get in Touch with EcoQuest!
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
            Have questions about your environmental journey? Our eco-warriors are here to help! 🚀
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              📝 Send us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    🎮 Player Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gradient-to-r from-white to-emerald-50/30"
                    placeholder="Your awesome name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gradient-to-r from-white to-emerald-50/30"
                    placeholder="your.email@ecoquest.com"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Quest Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gradient-to-r from-white to-emerald-50/30"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gradient-to-r from-white to-emerald-50/30"
                  placeholder="What's your quest about?"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  💬 Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gradient-to-r from-white to-emerald-50/30 resize-none"
                  placeholder="Tell us about your eco-adventure or how we can help..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    🚀 Sending your message...
                  </>
                ) : (
                  '📤 Send Message to EcoQuest!'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                🌍 Connect with Our Eco-Community
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{info.title}</h3>
                        <p className="text-emerald-600 font-medium">{info.content}</p>
                        <p className="text-gray-600 text-sm">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                ❓ Quick Eco-Answers
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🎮 How do I start my eco-journey?</h4>
                  <p className="text-gray-600 text-sm">Simply register for free and begin your first environmental quest!</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🏆 How do achievements work?</h4>
                  <p className="text-gray-600 text-sm">Complete challenges, learn new concepts, and unlock badges as you progress!</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">💚 Is EcoQuest really free?</h4>
                  <p className="text-gray-600 text-sm">Yes! 100% free forever. We believe environmental education should be accessible to all.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;