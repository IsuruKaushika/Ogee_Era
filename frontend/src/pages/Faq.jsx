import React from "react";
import { Link } from "react-router-dom";
import { FAQ_GROUPS } from "../data/faqs";

const Faq = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-[#414141]">
    <div className="border-b border-gray-300 pb-10 mb-10">
      <div className="flex items-center gap-2">
        <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
        <p className="font-medium text-sm md:text-base">HELP & SUPPORT</p>
      </div>
      <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
        Frequently Asked Questions
      </h1>
      <p className="text-sm md:text-base">
        Answers about ordering, payment, delivery and returns at OgeeEra.
      </p>
    </div>

    {FAQ_GROUPS.map((group) => (
      <section key={group.title} className="mb-10">
        <h2 className="prata-regular text-xl mb-4">{group.title}</h2>
        <div className="grid gap-4">
          {group.items.map((item) => (
            <div key={item.q} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">{item.q}</h3>
              <p className="text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    ))}

    <p className="text-sm">
      Still need help? <Link to="/contact" className="underline">Contact us</Link> or read our{" "}
      <Link to="/return-policy" className="underline">full return policy</Link>.
    </p>
  </div>
);

export default Faq;
