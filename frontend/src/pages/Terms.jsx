import React, { useState } from 'react';

const Terms = () => {
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
    jurisdiction: false
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
      {/* Header section with styling similar to Hero component */}
      <div className="flex flex-col sm:flex-row border-b border-gray-300 pb-10 mb-10">
        <div className="w-full flex items-center justify-center py-10">
          <div className="text-[#414141]">
            <div className="flex items-center gap-2">
              <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
              <p className="font-medium text-sm md:text-base">LEGAL INFORMATION</p>
            </div>
            <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">Terms & Conditions</h1>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm md:text-base">LAST UPDATED: MAY 3, 2025</p>
              <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Section id="terms" title="1. Terms of Use">
          <p>By accessing this Website and/or using our e-commerce service ("Service"), you agree to comply with the Terms and all policies/notices outlined on the Website.</p>
          <p className="mt-2">If you disagree with any part of these Terms (as amended periodically), you must cease using the Website and Service immediately. We may update, modify, or replace portions of these Terms by posting revisions on the Website, and you are responsible for reviewing this page regularly for updates.</p>
          <p className="mt-2">These Terms also govern your interaction with our social media platforms, including Facebook, Twitter, and Instagram.</p>
          
          <h3 className="font-semibold mt-6 mb-2 text-[#414141]">General Conditions</h3>
          <p>We retain the right to deny service to any individual, at any time, for any reason. We may limit the availability of products/services offered. Product descriptions, pricing, and availability are subject to change without prior notice at our discretion. We reserve the right to discontinue any product at any time.</p>
        </Section>

        <Section id="product" title="2. Product Information">
          <p>All items listed on the Website are subject to stock availability. If a product you ordered is out of stock, we will promptly notify you and issue a refund using the original payment method.</p>
          <p className="mt-2">Please be aware that products shown on the Website may not be available in physical stores, and vice versa. We cannot ensure that any product or service displayed on the Website will be in stock at a specific time or location.</p>
          <p className="mt-2">Product images on the Website are intended for visual reference only. While we strive to present products accurately, minor discrepancies between the images and actual items may occur.</p>
          <p className="mt-2">Adhering to the care instructions provided on product labels is essential to prevent damage. Any harm caused by improper care is not classified as a product defect. Once a garment has been washed and its tags are removed, it becomes ineligible for exchanges under any circumstances.</p>
        </Section>

        <Section id="order" title="3. Placing an Order">
          <p>To place an order, browse the Website, select items for your cart, and proceed to checkout. At checkout, you may either create an account or use the guest checkout feature. Account creation requires providing specific mandatory personal details.</p>
          <p className="mt-2">By registering an account, you affirm that the personal information supplied is accurate, current, and truthful. You are accountable for safeguarding your account credentials and password. We are not responsible for any loss or damage arising from unauthorized access to your account. Notify us immediately if you suspect any unauthorized activity.</p>
          <p className="mt-2">When using guest checkout, we will store your personal information solely to fulfill your order.</p>
          <p className="mt-2">Completing the online checkout process does not signify our acceptance of your order. Your order is officially accepted only once payment is successfully processed and you receive email confirmation that the products have been dispatched.</p>
        </Section>

        <Section id="risk" title="4. Risk and Title">
          <p>Responsibility for the products, along with ownership, transfers to you upon delivery. For exchanged items, liability shifts from you to us once the products reach our designated location.</p>
        </Section>

        <Section id="payment" title="5. Price and Payment">
          <p>Payment for products is restricted to the methods displayed on our site or via a valid gift voucher issued by us.</p>
          <p className="mt-2">A third-party payment processor ("Payment Processor") handles transactions, and you submit payment details directly to them. Payments are governed by the Payment Processor's terms, privacy policies, and these Terms. We are not liable for errors by the Payment Processor or liable for losses arising from third-party unauthorized access to information provided through the Payment Processor's link.</p>
          <p className="mt-2">Prices may change at any time, but adjustments do not apply to orders already paid for.</p>
          <p className="mt-2">While we strive for accuracy, our Website may occasionally contain typographical errors, inaccuracies, or omissions related to product details, pricing, promotions, offers, or availability. We reserve the right to correct errors, update information, decline orders, or cancel orders due to inaccuracies at any time without prior notice.</p>
        </Section>

        <Section id="warranty" title="6. Warranties; Limitation of Liability">
          <p>We do not guarantee that your use of our services will be uninterrupted, secure, timely, or free from errors.</p>
          <p className="mt-2">We do not ensure the accuracy or reliability of any outcomes resulting from the use of our services.</p>
          <p className="mt-2">You acknowledge that we may suspend the service indefinitely or terminate it entirely at any time without prior notice.</p>
          <p className="mt-2">Your use of, or inability to use, the service is solely at your own risk. All products and services provided through the service (unless explicitly stated otherwise by us) are offered "as is" and "as available," without any guarantees, representations, or warranties-express or implied-including but not limited to implied warranties of merchantability, quality, fitness for a specific purpose, durability, title, or non-infringement.</p>
          <p className="mt-2">Ogee Era, along with its directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors, shall not be held liable for any injury, loss, claim, or damages-direct, indirect, incidental, punitive, special, or consequential-including lost profits, revenue, savings, data, replacement costs, or similar losses, whether arising from contract, tort (including negligence), strict liability, or otherwise, due to your use of the service, products obtained through it, or any related claims.</p>
        </Section>

        <Section id="indemnification" title="7. Indemnification">
          <p>You agree to compensate, protect, and absolve Ogee Era, along with its subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns, and employees, from any third-party claims, demands, or expenses (including reasonable legal fees) resulting from your violation of these Terms of Service, related documents, or any law, or infringement of a third-party's rights.</p>
        </Section>

        <Section id="force" title="8. Force Majeure">
          <p>We cannot be held liable for failing to fulfill or delaying any contractual obligations due to unforeseeable events beyond our control ("Force Majeure").</p>
          <p className="mt-2">Force Majeure encompasses circumstances outside our reasonable influence, including but not limited to: (a) strikes, lockouts, or labor disputes; (b) civil unrest, riots, invasions, terrorist acts/threats, war (declared or undeclared), or war preparations; (c) fires, explosions, storms, floods, earthquakes, subsidence, epidemics, or natural disasters; (d) inability to use railways, shipping, air, road, or other transportation systems; (e) disruptions to public/private telecommunications networks; (f) governmental actions, laws, regulations, or restrictions; and (g) pandemics or epidemics.</p>
          <p className="mt-2">Our obligations are suspended for the duration of the Force Majeure event, and timelines for fulfillment will be extended accordingly. We will make reasonable efforts to resolve the event or find alternatives to meet our obligations during such circumstances.</p>
        </Section>

        <Section id="website" title="9. Website Terms of Use">
          <h3 className="font-semibold mt-2 mb-2 text-[#414141]">Accessing the Website</h3>
          <p>Our Website is accessible on a temporary basis, and we retain the right to withdraw, restrict, or modify the Service without prior notice. We are not responsible if the Website becomes unavailable at any time or for any duration.</p>
          <p className="mt-2">Occasionally, we may limit access to certain sections or the entire Website to registered users.</p>
          <p className="mt-2">You are responsible for arranging your own access to the Website and ensuring that anyone using your internet connection to visit the site is aware of and adheres to these terms.</p>
          <p className="mt-2">You agree not to reproduce, duplicate, copy, sell, resell, or exploit any part of the Website, its Service, content, or access points without our explicit written consent.</p>
        </Section>

        <Section id="intellectual" title="10. Intellectual Property">
          <p>You acknowledge that all copyrights, trademarks, and intellectual property rights in the Website's content remain our exclusive property. Use of this material is permitted only as authorized by us.</p>
          <p className="mt-2">Unless stated otherwise, all content on this Website-including images, illustrations, designs, icons, photographs, videos, and text-is owned by us and protected by Sri Lankan and international copyright laws. The Website's compilation is our exclusive property and similarly protected.</p>
          <p className="mt-2">All trademarks, service marks, and trade names ("Marks") displayed on the Website are our property. You may not use, reproduce, remove, or alter the Marks without our prior written consent.</p>
          <p className="mt-2">By posting content on our social media channels, you grant us a global, non-exclusive, royalty-free license (including sublicensing rights) to use, modify, publish, and distribute the content in any media, existing or future. You confirm that: (a) you are at least 18 years old and legally competent; (b) you own the content exclusively; (c) our use of it will not infringe third-party rights (including copyrights); (d) it contains no confidential information; (e) it includes no unsolicited ads or promotions; and (f) you will defend us against related claims.</p>
        </Section>

        <Section id="information" title="11. Information About You and Your Website Visits">
          <p>Your information is handled in compliance with our Privacy Policy.</p>
        </Section>

        <Section id="viruses" title="12. Viruses, Hacking, and Related Offenses">
          <p>While we strive to keep the Website free of viruses or defects, we cannot guarantee that its use-or access to linked sites-will not harm your device. You are responsible for using appropriate equipment and safeguards to prevent damage.</p>
          <p className="mt-2">You are prohibited from misusing the Website by intentionally introducing harmful or malicious elements. Unauthorized attempts to access the Website, its servers, or connected systems/databases are strictly forbidden.</p>
        </Section>

        <Section id="jurisdiction" title="13. Jurisdiction and Governing Law">
          <p>Claims related to your use of the Website or Service fall under the exclusive jurisdiction of Sri Lankan courts. However, we may pursue legal action against you in your country of residence or other relevant jurisdictions for breaches of these Terms. These Terms are governed by Sri Lankan law.</p>
        </Section>
      </div>

      {/* Footer section with styling similar to Hero component */}
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

export default Terms;