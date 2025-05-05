import React, { useState } from 'react';

const Policy = () => {
  const [expandedSections, setExpandedSections] = useState({
    terms: true,
    product: false,
    order: false,
    risk: false,
    payment: false,
    warranty: false,
    indemnification: false,
    force: false,
    website: false,
    intellectual: false,
    information: false,
    viruses: false,
    jurisdiction: false,
    privacyIntro: false,
    personalData: false,
    usage: false,
    cookies: false,
    thirdParty: false,
    security: false,
    changes: false,
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
              <p className="font-medium text-sm md:text-base">LEGAL INFORMATION</p>
            </div>
            <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">Privacy Policy</h1>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm md:text-base">LAST UPDATED: MAY 5, 2025</p>
              <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Existing Terms Sections (re-use yours here) */}
        <Section id="terms" title="1. Terms of Use">
          <p>By accessing this Website and/or using our services, you agree to comply with our Terms and all policies outlined herein.</p>
        </Section>
        <Section id="product" title="2. Product Information">
          <p>All items listed are subject to availability. Photos may differ slightly from actual products.</p>
        </Section>
        <Section id="order" title="3. Placing an Order">
          <p>Orders must be completed online. A confirmation email will be sent after payment is processed.</p>
        </Section>
        <Section id="risk" title="4. Risk and Title">
          <p>Ownership transfers upon product delivery.</p>
        </Section>
        <Section id="payment" title="5. Price and Payment">
          <p>We use a third-party payment processor. Prices may change without notice.</p>
        </Section>
        <Section id="warranty" title="6. Warranties; Limitation of Liability">
          <p>All services are provided "as-is". We are not liable for damages or losses.</p>
        </Section>
        <Section id="indemnification" title="7. Indemnification">
          <p>You agree to indemnify our company against any third-party claims.</p>
        </Section>
        <Section id="force" title="8. Force Majeure">
          <p>We are not liable for delays caused by events beyond our control.</p>
        </Section>
        <Section id="website" title="9. Website Terms of Use">
          <p>Do not reproduce, copy, or exploit any content from our website without permission.</p>
        </Section>
        <Section id="intellectual" title="10. Intellectual Property">
          <p>All content is owned by our company and protected by copyright laws.</p>
        </Section>

        {/* Privacy Policy Sections */}
        <Section id="privacyIntro" title="11. Privacy Policy - Introduction">
          <p>This Privacy Policy outlines how we collect, use, and protect your personal data when you visit our site or make a purchase.</p>
        </Section>

        <Section id="personalData" title="12. Information We Collect">
          <p>We collect information you provide during registration, order placement, or newsletter sign-up. This includes your name, email, phone number, shipping address, and payment details.</p>
        </Section>

        <Section id="usage" title="13. How We Use Your Information">
          <p>We use your data to process orders, deliver products, send promotional offers, improve our site experience, and comply with legal obligations.</p>
        </Section>

        <Section id="cookies" title="14. Cookies and Tracking">
          <p>We use cookies and similar technologies to enhance your browsing experience. Cookies help us understand user behavior and personalize content. You can disable cookies in your browser settings.</p>
        </Section>

        <Section id="thirdParty" title="15. Third-Party Services">
          <p>We may share data with third-party vendors such as payment processors and shipping companies, solely for order fulfillment purposes. These parties are obligated to protect your information.</p>
        </Section>

        <Section id="security" title="16. Data Security">
          <p>We implement a variety of security measures including encryption and secure servers to maintain the safety of your personal information. However, no system is 100% secure.</p>
        </Section>

        <Section id="changes" title="17. Changes to This Policy">
          <p>We reserve the right to modify this Privacy Policy at any time. Updates will be posted on this page with an updated effective date.</p>
        </Section>

        <Section id="contact" title="18. Contact Us">
          <p>If you have questions about these Terms or our Privacy Policy, please contact us at <a href="mailto:support@ogeeera.com" className="text-blue-600 underline">support@ogeeera.com</a>.</p>
        </Section>
      </div>
    </div>
  );
};

export default Policy;
