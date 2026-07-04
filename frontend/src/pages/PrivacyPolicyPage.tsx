import React from 'react';

import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container-max py-24 md:py-32">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-black text-[#1A1A2E] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-lg text-gray-600 prose-headings:font-bold prose-headings:text-[#1A1A2E] prose-a:text-[#1B5442]">
            <p>
              Welcome to SIYP Team. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">1. Important information and who we are</h3>
            <p>
              SIYP Team is the controller and responsible for your personal data. We have appointed a data privacy manager who is responsible for overseeing questions in relation to this privacy policy. If you have any questions about this privacy policy, please contact us at <strong>our facebook page</strong>.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">2. The data we collect about you</h3>
            <p>
              Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, operating system and platform.</li>
              <li><strong>Profile Data</strong> includes your username and password, opportunities saved or applied for by you, your interests, preferences, and feedback.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">3. How we use your personal data</h3>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">4. Data security</h3>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">5. Your legal rights</h3>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data. You have the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
            <p className="mt-4">
              If you wish to exercise any of the rights set out above, please contact us.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
