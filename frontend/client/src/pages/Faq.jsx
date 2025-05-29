import React, { useState, useEffect, useRef } from 'react';
import '../styles/Faq.css';
import Navbar from '../components/common/Navbar';
import { useNavigate } from 'react-router-dom';

const Faq = () => {

  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  
  const faqData = {
    general: [
      {
        question: "What is Rentora?",
        answer: "Rentora is a premium real estate platform that connects property owners with potential tenants and buyers. We provide a secure, transparent marketplace for renting and buying properties with verified listings and comprehensive property details."
      },
      {
        question: "How does Rentora verify property listings?",
        answer: "All properties listed on Rentora undergo a thorough verification process. Our team validates property ownership documents, conducts physical inspections when possible, and verifies the identity of property owners to ensure all listings are legitimate and accurately represented."
      },
      {
        question: "Is Rentora available in my city?",
        answer: "Rentora is rapidly expanding across major cities. Currently, we operate in over 50 metropolitan areas with plans to expand to more locations soon. You can check if we're available in your area by entering your city or zip code in the search bar on our homepage."
      },
      {
        question: "How do I contact Rentora customer support?",
        answer: "You can reach our customer support team through multiple channels: email us at support@rentora.com, call our helpline at +1 (234) 567-890, or use the live chat feature on our website. Our support team is available Monday through Friday, 9 AM to 6 PM."
      }
    ],
    renters: [
      {
        question: "How do I search for rental properties on Rentora?",
        answer: "You can search for rental properties by using our advanced search filters. Enter your desired location, budget range, property type, number of bedrooms, and other preferences to find properties that match your requirements. You can also save your search criteria to receive notifications when new matching properties are listed."
      },
      {
        question: "Are utilities included in the rent?",
        answer: "Utility inclusion varies by property. Each listing specifies which utilities (if any) are included in the rent. You can find this information in the 'Additional Details' section of each property listing. If you have specific questions about utilities, you can directly message the property owner through our platform."
      },
      {
        question: "How do I schedule a property viewing?",
        answer: "To schedule a viewing, navigate to the property listing you're interested in and click the 'Schedule Viewing' button. You'll be prompted to select available dates and times. The property owner or manager will confirm your appointment, and you'll receive a confirmation notification with all the details."
      },
      {
        question: "What documents do I need to apply for a rental?",
        answer: "Typically, you'll need proof of identity (government-issued ID), proof of income (pay stubs, employment letter, or bank statements), credit history, references from previous landlords, and sometimes a background check. Specific requirements may vary by property, and all required documents will be listed in the application process."
      }
    ],
    owners: [
      {
        question: "How do I list my property on Rentora?",
        answer: "To list your property, create a seller account, click on 'Add Listing' in your dashboard, and follow the step-by-step process. You'll need to provide property details, upload high-quality photos, set your price, and specify terms. Our team will review your listing before it goes live to ensure it meets our quality standards."
      },
      {
        question: "What fees does Rentora charge property owners?",
        answer: "Rentora offers flexible pricing plans for property owners. Our basic listing plan is free with limited features. Premium plans start at $29.99/month with enhanced visibility and additional features. We also offer a success-based model where we charge a small percentage only when your property is successfully rented or sold."
      },
      {
        question: "How does Rentora screen potential tenants?",
        answer: "Rentora provides comprehensive tenant screening tools including credit checks, background verification, income verification, and rental history analysis. You can set your screening criteria, and our system will automatically filter applicants accordingly. You always maintain final decision-making authority on tenant selection."
      },
      {
        question: "Can I manage multiple properties under one account?",
        answer: "Yes, Rentora allows you to manage unlimited properties under a single account. Our dashboard provides a comprehensive overview of all your listings, allowing you to track performance, manage inquiries, and update details for each property individually or in bulk."
      }
    ],
    payments: [
      {
        question: "What payment methods are accepted on Rentora?",
        answer: "Rentora accepts various payment methods including credit/debit cards (Visa, Mastercard, American Express), PayPal, bank transfers, and in some regions, digital wallets like Apple Pay and Google Pay. All payments are processed through our secure payment gateway with industry-standard encryption."
      },
      {
        question: "Is there a security deposit for rentals?",
        answer: "Security deposit requirements are set by individual property owners and will be clearly stated in the listing details. Rentora offers a secure deposit holding service that protects both parties. Deposits are released according to the terms specified in the rental agreement and applicable local laws."
      },
      {
        question: "How does Rentora handle rent payments?",
        answer: "Rentora offers a secure rent collection system where tenants can set up automatic monthly payments. Property owners receive funds directly to their designated bank account. Our platform maintains payment records and automatically generates receipts for both parties for transparency and tax purposes."
      },
      {
        question: "What happens if I need to cancel my reservation?",
        answer: "Cancellation policies vary by property and are set by the property owner. These policies are clearly displayed on each listing before you make a reservation. Depending on the policy and how far in advance you cancel, you may be eligible for a full or partial refund. All cancellations should be made through the Rentora platform."
      }
    ],
    technical: [
      {
        question: "How do I reset my password?",
        answer: "To reset your password, click on the 'Forgot Password' link on the login page. Enter the email address associated with your account, and we'll send you a password reset link. Follow the instructions in the email to create a new password. For security reasons, reset links expire after 24 hours."
      },
      {
        question: "Is my personal information secure on Rentora?",
        answer: "Yes, protecting your data is our priority. We use industry-standard encryption protocols to secure all personal and financial information. We never share your data with unauthorized third parties. You can review our comprehensive Privacy Policy for detailed information on how we collect, use, and protect your data."
      },
      {
        question: "Can I use Rentora on my mobile device?",
        answer: "Absolutely! Rentora is fully optimized for mobile use. You can access all features through your mobile browser, or download our dedicated apps available for both iOS and Android devices. Our mobile experience offers the same functionality as the desktop version, including property searches, messaging, and payments."
      },
      {
        question: "How do I report a technical issue or bug?",
        answer: "If you encounter any technical issues, please go to the 'Help' section in your account menu and select 'Report a Problem.' Provide as much detail as possible, including screenshots if applicable. Our technical team will investigate and respond promptly. For urgent issues, you can contact our support team directly."
      }
    ]
  };

  
  const allFaqs = Object.values(faqData).flat();

  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFaqs([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = allFaqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFaqs(results);
  }, [searchTerm]);

  
  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setFilteredFaqs([]);
  };

  
  useEffect(() => {
    const handleTabClick = (e) => {
      if (!e.target.classList.contains('category-tab')) return;
      
    
      document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      
      e.target.classList.add('active');
      
  
      document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
      });
      

      const target = e.target.getAttribute('data-target');
      const targetElement = document.getElementById(target);
      if (targetElement) {
        targetElement.classList.add('active');
      }
    };

    document.addEventListener('click', handleTabClick);
    
    return () => {
      document.removeEventListener('click', handleTabClick);
    };
  }, []);

  return (
    <div className="faq-page">
      <Navbar />
      <div className="faq-hero">
        <div className="faq-hero-content">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Rentora's services</p>
          
          <div className="faq-search-container">
            <div className="faq-search-box">
              <div className="search-icon" onClick={focusSearchInput}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="faq-hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="faq-container">
        {isSearching ? (
          <div className="faq-search-results">
            <h2>Search Results {filteredFaqs.length > 0 ? `(${filteredFaqs.length})` : ''}</h2>
            
            {filteredFaqs.length > 0 ? (
              <div className="faq-list">
                {filteredFaqs.map((faq, index) => (
                  <div 
                    className={`faq-item ${activeIndex === `search-${index}` ? 'active' : ''}`} 
                    key={`search-${index}`}
                  >
                    <div 
                      className="faq-question"
                      onClick={() => toggleFaq(`search-${index}`)}
                    >
                      <h3>{faq.question}</h3>
                      <div className="faq-icon">
                        <span className="plus">+</span>
                        <span className="minus">−</span>
                      </div>
                    </div>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3>No matching questions found</h3>
                <p>Try different keywords or browse our categories below</p>
                <button className="browse-all-btn" onClick={clearSearch}>Browse All FAQs</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="faq-categories">
              <div className="category-tabs">
                <button className="category-tab active" data-target="general">General</button>
                <button className="category-tab" data-target="renters">For Renters</button>
                <button className="category-tab" data-target="owners">For Property Owners</button>
                <button className="category-tab" data-target="payments">Payments & Billing</button>
                <button className="category-tab" data-target="technical">Technical Support</button>
              </div>
            </div>

            <div className="faq-content">
              <div className="category-content active" id="general">
                <h2>General Questions</h2>
                <div className="faq-list">
                  {faqData.general.map((faq, index) => (
                    <div 
                      className={`faq-item ${activeIndex === `general-${index}` ? 'active' : ''}`} 
                      key={`general-${index}`}
                    >
                      <div 
                        className="faq-question"
                        onClick={() => toggleFaq(`general-${index}`)}
                      >
                        <h3>{faq.question}</h3>
                        <div className="faq-icon">
                          <span className="plus">+</span>
                          <span className="minus">−</span>
                        </div>
                      </div>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="category-content" id="renters">
                <h2>For Renters</h2>
                <div className="faq-list">
                  {faqData.renters.map((faq, index) => (
                    <div 
                      className={`faq-item ${activeIndex === `renters-${index}` ? 'active' : ''}`} 
                      key={`renters-${index}`}
                    >
                      <div 
                        className="faq-question"
                        onClick={() => toggleFaq(`renters-${index}`)}
                      >
                        <h3>{faq.question}</h3>
                        <div className="faq-icon">
                          <span className="plus">+</span>
                          <span className="minus">−</span>
                        </div>
                      </div>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="category-content" id="owners">
                <h2>For Property Owners</h2>
                <div className="faq-list">
                  {faqData.owners.map((faq, index) => (
                    <div 
                      className={`faq-item ${activeIndex === `owners-${index}` ? 'active' : ''}`} 
                      key={`owners-${index}`}
                    >
                      <div 
                        className="faq-question"
                        onClick={() => toggleFaq(`owners-${index}`)}
                      >
                        <h3>{faq.question}</h3>
                        <div className="faq-icon">
                          <span className="plus">+</span>
                          <span className="minus">−</span>
                        </div>
                      </div>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="category-content" id="payments">
                <h2>Payments & Billing</h2>
                <div className="faq-list">
                  {faqData.payments.map((faq, index) => (
                    <div 
                      className={`faq-item ${activeIndex === `payments-${index}` ? 'active' : ''}`} 
                      key={`payments-${index}`}
                    >
                      <div 
                        className="faq-question"
                        onClick={() => toggleFaq(`payments-${index}`)}
                      >
                        <h3>{faq.question}</h3>
                        <div className="faq-icon">
                          <span className="plus">+</span>
                          <span className="minus">−</span>
                        </div>
                      </div>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="category-content" id="technical">
                <h2>Technical Support</h2>
                <div className="faq-list">
                  {faqData.technical.map((faq, index) => (
                    <div 
                      className={`faq-item ${activeIndex === `technical-${index}` ? 'active' : ''}`} 
                      key={`technical-${index}`}
                    >
                      <div 
                        className="faq-question"
                        onClick={() => toggleFaq(`technical-${index}`)}
                      >
                        <h3>{faq.question}</h3>
                        <div className="faq-icon">
                          <span className="plus">+</span>
                          <span className="minus">−</span>
                        </div>
                      </div>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="faq-cta-section">
        <div className="cta-content">
          <h2>Still have questions?</h2>
          <p>Our customer support team is here to help you with any questions or concerns</p>
          <div className="cta-buttons">
            <a href="/contact" className="cta-button primary">Contact Support</a>
            <a href="/feedback" className="cta-button secondary">Give Feedback</a>
          </div>
        </div>
        <div className="cta-decoration">
          <div className="floating-element fe-1"></div>
          <div className="floating-element fe-2"></div>
          <div className="floating-element fe-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Faq;