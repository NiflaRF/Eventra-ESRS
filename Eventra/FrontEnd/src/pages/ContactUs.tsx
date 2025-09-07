import React, { useState } from "react";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend logic, just reset form for now
    setForm({ name: "", email: "", message: "" });
  };

  return (
<div className="min-h-screen w-screen flex flex-col items-stretch relative" style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="about-container w-full max-w-3xl mx-auto mt-12 mb-12 px-8 py-10 bg-black bg-opacity-70 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-center mb-2 text-white drop-shadow-lg">Contact Us</h1>
          <p className="text-lg text-center text-gray-100 mb-8 w-full font-medium drop-shadow">
            Get in touch with us for your next event
          </p>
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
              className="w-full bg-gray-900 text-white font-bold rounded-lg py-3 mt-2 shadow-md border border-white hover:bg-gray-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 