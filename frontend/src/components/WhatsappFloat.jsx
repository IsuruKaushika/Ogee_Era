// src/components/WhatsAppFloat.js
import React from 'react';

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/94712205395" // Change this to your number in international format without +
      className="fixed bottom-5 right-5 z-50"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png" // WhatsApp icon URL or use your own
        alt="WhatsApp"
        className="w-12 h-12 hover:scale-110 transition-transform duration-200"
      />
    </a>
  );
};

export default WhatsAppFloat;
