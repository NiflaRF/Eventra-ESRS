import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";

const faqs = [
  {
    question: "How do I reserve an event space?",
    answer: "You can reserve an event space by logging into your account, navigating to the Booking section, and selecting your preferred venue, date, and time.",
  },
  {
    question: "Can I modify or cancel my reservation?",
    answer: "Yes, you can modify or cancel your reservation from your dashboard up to 24 hours before the event.",
  },
  {
    question: "Are there any fees for booking an event space?",
    answer: "Some venues may require a booking fee or deposit. Details are provided during the reservation process.",
  },
  {
    question: "What facilities are included with the event spaces?",
    answer: "Facilities vary by venue but may include seating, audio/visual equipment, Wi-Fi, and catering options.",
  },
  {
    question: "How far in advance can I book a space?",
    answer: "You can book event spaces up to 6 months in advance, subject to availability.",
  },
  {
    question: "Who can book event spaces?",
    answer: "Event spaces can be booked by students, faculty, staff, and approved external organizations, depending on the venue's policy.",
  },
  {
    question: "How do I check the availability of a venue?",
    answer: "Availability is shown in real-time on the booking calendar for each venue.",
  },
  {
    question: "What is the process for event approval?",
    answer: "Some events may require administrative approval. You will be notified of the status via email and your dashboard.",
  },
  {
    question: "Can I request special equipment or services?",
    answer: "Yes, you can request additional equipment or services during the booking process or by contacting the venue manager.",
  },
];

const FAQs = () => (
  <div className="min-h-screen w-screen flex flex-col items-stretch relative" style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
    <div className="w-full relative z-10 flex flex-col items-center">
      <div className="about-container w-full max-w-3xl mx-auto mt-12 mb-12 px-8 py-10 bg-black bg-opacity-70 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-white drop-shadow-lg">Frequently Asked Questions</h1>
        <p className="text-center text-gray-100 mb-8 w-full font-medium drop-shadow">
          Welcome! We've compiled a list of frequently asked questions to help you. If you cannot find the necessary information, please get in touch with us.
        </p>
        <div className="shadow-lg border rounded-xl bg-gray-800 bg-opacity-70 p-8 mb-12 w-full">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Getting Started</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={"faq-" + idx}>
                <AccordionTrigger className="text-white">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-white">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  </div>
);

export default FAQs; 