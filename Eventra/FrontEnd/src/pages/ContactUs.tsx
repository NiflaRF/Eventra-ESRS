import React, { useState } from "react";
import { apiService } from "../services/api";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const ContactUs = () => {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear notification when user starts typing
    if (notification) setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setNotification({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiService.submitContactForm(form);
      
      if (response.success) {
        setNotification({ 
          type: 'success', 
          message: response.message || 'Your message has been sent successfully! We\'ll get back to you soon.'
        });
        setForm({ name: "", email: "", message: "" });
      } else {
        setNotification({ 
          type: 'error', 
          message: response.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: 'An error occurred while sending your message. Please try again later.'
      });
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<div className="min-h-screen w-screen flex flex-col items-stretch relative" style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="about-container w-full max-w-3xl mx-auto mt-12 mb-12 px-8 py-10 bg-black bg-opacity-70 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-center mb-2 text-white drop-shadow-lg">Contact Us</h1>
          <p className="text-lg text-center text-gray-100 mb-8 w-full font-medium drop-shadow">
            Get in touch with us for your next event
          </p>

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg text-white text-center font-medium ${
              notification.type === 'success' 
                ? 'bg-green-600 bg-opacity-80' 
                : 'bg-red-600 bg-opacity-80'
            }`}>
              {notification.message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 bg-opacity-70 shadow-lg rounded-xl p-8 w-full flex flex-col gap-6"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-white font-bold mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white font-medium bg-gray-900 placeholder-gray-300"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-white font-bold mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  className="w-full border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white font-medium bg-gray-900 placeholder-gray-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-white font-bold mb-1" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your message"
                rows={5}
                className="w-full border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white font-medium bg-gray-900 placeholder-gray-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold rounded-lg py-3 mt-2 shadow-md border border-white transition-colors ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gray-900 hover:bg-gray-700'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 