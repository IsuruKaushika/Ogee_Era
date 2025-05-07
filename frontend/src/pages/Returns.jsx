import React, { useState } from 'react';

const Returns = () => {
  const [expandedSections, setExpandedSections] = useState({
    returns: true,
    refunds: false,
    exchanges: false,
    nonReturnable: false,
    damaged: false,
    shipping: false,
    processing: false,
    contact: false
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const Section = ({ id, title, children }) => (
    <div className="mb-8 pb-4 border-b border-gray-300">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => toggleSection(id)}
      >
        <h2 className="prata-regular text-xl text-[#414141]">{title}</h2>
        <div className="text-[#414141] text-lg">
          {expandedSections[id] ? '−' : '+'}
        </div>
      </div>
      {expandedSections[id] && (
        <div className="mt-4 text-[#414141] space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col sm:flex-row border-b border-gray-300 pb-10 mb-10">
        <div className="w-full flex items-center justify-center py-10">
          <div className="text-[#414141]">
            <div className="flex items-center gap-2">
              <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
              <p className="font-medium text-sm md:text-base">HELP & SUPPORT</p>
            </div>
            <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
              Return & Refund Policy
            </h1>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm md:text-base">LAST UPDATED: MAY 3, 2025</p>
              <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Section id="returns" title="1. Returns">
          <p>We accept returns within 7 days of your purchase date. Items must be unused, in original condition, and returned in their original packaging.</p>
        </Section>

        <Section id="refunds" title="2. Refunds">
          <p>Once we receive and inspect your returned item, we’ll notify you of your refund approval status. If approved, a refund will be processed to your original payment method.</p>
          <p className="mt-2">Refunds exclude any shipping costs paid during the initial order.</p>
        </Section>

        <Section id="exchanges" title="3. Exchanges">
          <p>To exchange an item (for size, color, or style), please contact our customer support within 3 days of receiving your order. We will guide you through the exchange process.</p>
        </Section>

        <Section id="nonReturnable" title="4. Non-Returnable Items">
          <ul className="list-disc pl-5 space-y-1">
            <li>Gift cards</li>
            <li>Personalized or custom-made items</li>
            <li>Dresses that have been worn</li>
          </ul>
        </Section>

        <Section id="damaged" title="5. Damaged or Defective Items">
          <p>If your order arrives damaged or defective, contact us immediately. We’ll arrange a replacement or a refund based on your preference and availability.</p>
        </Section>

        <Section id="shipping" title="6. Return Shipping">
          <p>You are responsible for return shipping costs unless the return is due to our error (e.g., wrong or defective item). If it's our fault, we’ll provide a prepaid return shipping label.</p>
        </Section>

        <Section id="processing" title="7. Processing Time">
          <p>Returns and exchanges are processed within 5 business days after we receive your returned item. Refund timelines may vary depending on your payment provider.</p>
        </Section>

        <Section id="contact" title="8. Contact Us">
          <p>If you have questions or need assistance with your return, our support team is here to help:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Email: ogeeeraa@gmail.com</li>
            <li>Phone: +94 71 220 5395</li>
            <li>Live Chat: Available on our website during business hours</li>
          </ul>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-300 flex flex-col items-center">
        <div className="text-[#414141]">
          <div className="flex items-center gap-2 justify-center">
            <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
            <p className="font-medium text-sm md:text-base">© 2025 OGEE ERA</p>
            <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
          </div>
          <p className="text-center text-sm mt-2">All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Returns;
