import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { FaFacebook, FaInstagram, FaWhatsapp, FaBars } from "react-icons/fa";
import { UserPlus, User } from "lucide-react";
import "../App.css";

const features = [
  {
    title: "Venues and Events",
    description: "Easily search university venues for seminars, cultural, and academic events.",
    
  },
  {
    title: "Bookins and Event Plannings",
    description: "Streamline bookings and event plannings with our step-by-step workflow tools.",
    
  },
  {
    title: "Support and Services",
    description: "Admins  can manage requests and resources efficiently.",
    
  },
  {
    title: "Role-based Dashboards",
    description: "Personalized dashboards for students, admins, Vice Chancellor, Administration of UWU and more..",
    
  },
];

const socialLinks = [
  { icon: <FaFacebook />, url: "https://facebook.com" },
  { icon: <FaInstagram />, url: "https://instagram.com" },
  { icon: <FaWhatsapp />, url: "https://wa.me/" },
];

const Home = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = React.useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50" style={{ width: '100vw', margin: 0, padding: 0 }}>
      {/* Header / Navigation Bar */}
      <header className="shadow-md sticky top-0 z-20" style={{ backgroundColor: '#4d0011' }}>
        <div className="w-full flex items-center justify-between py-4 px-4 md:px-0">
          <div className="flex items-center gap-2">
            <img src="/Logo UWU.png" alt="UWU Logo" className="h-16 w-auto ml-4" />
            <span className="text-2xl font-bold ml-6 text-white">Eventra</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/" className="hover:text-blue-200 font-medium text-white">Home</Link>
            <Link to="/about" className="hover:text-blue-200 font-medium text-white">About Us</Link>
            <a href="#features" className="hover:text-blue-200 font-medium text-white">Features</a>
            <Link to="/contact" className="hover:text-blue-200 font-medium text-white">Contact Us</Link>
            <Link to="/faqs" className="hover:text-blue-200 font-medium text-white">FAQs</Link>
          </nav>
          <div className="hidden md:flex gap-2 mr-8">
            <Button onClick={() => navigate("/login")}
              className="bg-white text-black hover:bg-blue-100 border border-white font-bold flex items-center"
            >
              <User className="mr-2 h-5 w-5" color="#000" /> Login
            </Button>
            <Button onClick={() => navigate("/register")}
              className="bg-white text-black hover:bg-blue-100 border border-white font-bold flex items-center"
            >
              <UserPlus className="mr-2 h-5 w-5" color="#000" /> Sign Up
            </Button>
          </div>
          <button className="md:hidden text-2xl text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            <FaBars />
          </button>
        </div>
        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-black border-t px-4 pb-4 flex flex-col gap-2 animate-fade-in">
            <Link to="/" onClick={() => setMobileMenu(false)} className="text-white">Home</Link>
            <Link to="/about" onClick={() => setMobileMenu(false)} className="text-white">About</Link>
            <a href="#features" onClick={() => setMobileMenu(false)} className="hover:text-blue-200 font-medium text-white">Features</a>
            <Link to="/contact" onClick={() => setMobileMenu(false)} className="text-white">Contact Us</Link>
            <Link to="/faqs" onClick={() => setMobileMenu(false)} className="text-white">FAQs</Link>
            <Button onClick={() => { setMobileMenu(false); navigate("/login"); }}
              className="bg-white text-black hover:bg-blue-100 border border-white font-bold flex items-center"
            >
              <User className="mr-2 h-5 w-5" color="#000" /> Login
            </Button>
            <Button onClick={() => { setMobileMenu(false); navigate("/register"); }}
              className="bg-white text-black hover:bg-blue-100 border border-white font-bold flex items-center"
            >
              <UserPlus className="mr-2 h-5 w-5" color="#000" /> Sign Up
            </Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        style={{
          backgroundColor: '#bd7880', // Rose
          width: '100%',
          minHeight: '350px',
        }}
        className="relative flex flex-col justify-center items-center text-center py-8 px-4 min-h-[350px]"
      >
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg text-center text-white">
            Seamless Venue Booking,<br />
            Make your Event happen
          </h1>
          {/* Subheading moved to the bottom of the hero section */}
        </div>
        {/* Subheading absolutely positioned at the bottom of the hero section */}
        {/* Removed the subheading sentence as requested */}
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 px-4 relative"
        style={{
          backgroundImage: "url('/CUs.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Take a look here...</h1>
          <p className="text-center text-gray-200 mb-10 text-lg">UNLOCK   SPACES  FOR  EVERY  EVENT  -  ALL  IN  ONE  PLACE  INSTANTLY</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-black bg-opacity-70 rounded-2xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center text-center border border-gray-900">
                <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                  {idx === 0 && <img src="/Open Air Theater.jpg" alt="Venues and Events" className="object-cover w-full h-full" />}
                  {idx === 1 && <img src="/Planning.jpg" alt="Bookings and Event Plannings" className="object-cover w-full h-full" />}
                  {idx === 2 && <img src="/Support and service.png" alt="Support and Services" className="object-cover w-full h-full" />}
                  {idx === 3 && <img src="/Dashboard.jpg" alt="Role-based Dashboards" className="object-cover w-full h-full" />}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-100 font-medium mb-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Support Info */}
      <section
        className="py-8 text-center relative"
        style={{
          backgroundColor: '#ffd9d9',
          width: '100%',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }} />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <p className="text-lg font-medium mb-2 text-black">Need help? We’re here for you.</p>
          <Button onClick={() => navigate("/contact")}
            className="bg-white text-black hover:bg-white border border-white font-bold flex items-center"
          >
            Contact Us
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-white py-8 mt-auto"
        style={{ backgroundColor: '#102b1f' }} // Pine
      >
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <div className="flex flex-col gap-1 mb-6">
            <Link to="/about" className="hover:underline text-white">About Us</Link>
            <Link to="/contact" className="hover:underline text-white">Contact Us</Link>
            <Link to="/terms" className="hover:underline text-white">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="hover:underline text-white">Privacy & Policy</Link>
          </div>
          
          <div className="text-sm text-center text-white">&copy; 2025 Eventra. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
