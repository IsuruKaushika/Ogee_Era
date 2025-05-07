import React, { useState } from 'react';

const Policy = () => {
  const [expandedSections, setExpandedSections] = useState({
    intro: true,
    information: false,
    use: false,
    sharing: false,
    security: false,
    cookies: false,
    changes: false,
    contact: false,
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
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
        <div className="mt-4 text-[#414141] space-y-3">{children}</div>
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
              Privacy Policy
            </h1>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm md:text-base">LAST UPDATED: MAY 3, 2025</p>
              <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Section id="intro" title="1. Overview">
          <p>
            At <strong>ogeeera.lk</strong>, we are committed to protecting the privacy and security of our customers' personal information. By using our website, you consent to the practices described in this policy.
          </p>
        </Section>

        <Section id="information" title="2. Information We Collect">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal identification:</strong> Name, email, phone number (provided during registration or checkout).</li>
            <li><strong>Payment & billing:</strong> Credit card and billing details (processed by secure third-party providers).</li>
            <li><strong>Browsing data:</strong> IP address, browser type, device info (collected through cookies and similar technologies).</li>
          </ul>
        </Section>

        <Section id="use" title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2">
            <li>To process and fulfill orders, including shipping.</li>
            <li>To provide support and respond to inquiries.</li>
            <li>To personalize your shopping experience and promotions.</li>
            <li>To improve our site and services based on your behavior.</li>
            <li>To detect and prevent fraudulent or unauthorized activities.</li>
          </ul>
        </Section>

        <Section id="sharing" title="4. Information Sharing">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>We do not sell or trade</strong> your personal data.</li>
            <li>
              <strong>Trusted service providers:</strong> We may share your info with partners for payment, delivery, or analytics. They are contractually obligated to keep it secure.
            </li>
            <li><strong>Legal disclosures:</strong> We may share data when required by law or in legal proceedings.</li>
          </ul>
        </Section>

        <Section id="security" title="5. Data Security">
          <p>
            We use industry-standard security practices to protect your data. However, no method of electronic storage or internet transmission is 100% secure. We cannot guarantee absolute protection.
          </p>
        </Section>

        <Section id="cookies" title="6. Cookies & Tracking Technologies">
          <p>
            We use cookies to enhance your browsing experience, analyze traffic, and understand preferences. You can disable cookies via your browser settings, though some site features may not work properly.
          </p>
        </Section>

        <Section id="changes" title="7. Changes to This Policy">
          <p>
            We reserve the right to update this policy at any time. Changes will be posted here with the revised date. Please review it regularly to stay informed.
          </p>
        </Section>

        <Section id="contact" title="8. Contact Us">
          <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Email: ogeeeraa@gmail.com</li>
            <li>Phone: +94 71 220 5395</li>
            <li>Live Chat: Available during business hours</li>
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

export default Policy;
