import React from 'react';

import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container-max py-24 md:py-32">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-black text-[#1A1A2E] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Terms of Service
          </h1>
          <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-lg text-gray-600 prose-headings:font-bold prose-headings:text-[#1A1A2E] prose-a:text-[#1B5442]">
            <p>
              Welcome to SIYP Team! These terms and conditions outline the rules and regulations for the use of the SIYP Team Website, located at siyp.team.
            </p>
            <p className="mt-4">
              By accessing this website we assume you accept these terms and conditions. Do not continue to use SIYP Team if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">1. Terminology</h3>
            <p>
              The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">2. Cookies</h3>
            <p>
              We employ the use of cookies. By accessing SIYP Team, you agreed to use cookies in agreement with the SIYP Team's Privacy Policy.
              Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">3. License</h3>
            <p>
              Unless otherwise stated, SIYP Team and/or its licensors own the intellectual property rights for all material on SIYP Team. All intellectual property rights are reserved. You may access this from SIYP Team for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Republish material from SIYP Team without attribution</li>
              <li>Sell, rent or sub-license material from SIYP Team</li>
              <li>Reproduce, duplicate or copy material from SIYP Team</li>
              <li>Redistribute content from SIYP Team without explicit permission</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">4. User Comments and Content</h3>
            <p>
              Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. SIYP Team does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of SIYP Team, its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions.
            </p>
            <p className="mt-4">
              SIYP Team reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">5. Disclaimer</h3>
            <p>
              To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>limit or exclude our or your liability for death or personal injury;</li>
              <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
              <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
              <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
