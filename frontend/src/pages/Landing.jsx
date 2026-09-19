import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        background: 'white',
        padding: '0 30px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>💳</span>
          <span style={{
            fontSize: '22px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ExpenseTrack
          </span>
        </div>

        {/* Nav Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              border: '2px solid #667eea',
              color: '#667eea',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 30px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '30px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '24px'
        }}>
          🚀 AI-Powered Expense Tracking
        </div>

        <h1 style={{
          fontSize: '56px',
          fontWeight: '800',
          margin: '0 0 20px',
          lineHeight: '1.1'
        }}>
          Track Every Rupee,<br />
          <span style={{ color: '#ffd700' }}>Effortlessly</span>
        </h1>

        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.7'
        }}>
          Upload receipts, let AI extract and categorize expenses automatically.
          Supports <strong>English & Tamil</strong> receipts!
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '18px 40px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '800',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }}
          >
            Get Started Free →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '18px 40px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '60px',
          flexWrap: 'wrap'
        }}>
          {[
            { value: '📸', label: 'Receipt Scanning' },
            { value: '🤖', label: 'AI Categorization' },
            { value: '🆓', label: '100% Free' },
            { value: '🇮🇳', label: 'Tamil + English' }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div style={{
        padding: '80px 30px',
        background: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#212529', margin: '0 0 10px' }}>
          How It Works
        </h2>
        <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '50px' }}>
          Three simple steps to track all your expenses
        </p>

        <div style={{
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { num: '1', icon: '📸', title: 'Upload Receipt', desc: 'Take a photo or upload any receipt image in English or Tamil' },
            { num: '2', icon: '🤖', title: 'AI Reads It', desc: 'Our OCR engine extracts merchant, amount, items and auto-categorizes' },
            { num: '3', icon: '📊', title: 'Track & Analyze', desc: 'See beautiful charts, set budgets and get smart spending insights' }
          ].map((step, i) => (
            <div key={i} style={{
              flex: '1',
              minWidth: '250px',
              maxWidth: '300px',
              padding: '36px 28px',
              background: '#f8f9ff',
              borderRadius: '20px',
              position: 'relative'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                color: 'white',
                fontWeight: '800',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                {step.num}
              </div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{step.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#212529', margin: '0 0 10px' }}>
                {step.title}
              </h3>
              <p style={{ color: '#6c757d', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FEATURES GRID ===== */}
      <div style={{
        padding: '80px 30px',
        background: '#f8f9ff',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#212529', margin: '0 0 10px' }}>
          Everything You Need
        </h2>
        <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '50px' }}>
          Powerful features to manage your finances smartly
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          {[
            { icon: '📸', title: 'Smart Receipt Scanning', desc: 'Upload any receipt and our AI extracts all details automatically' },
            { icon: '🇮🇳', title: 'Tamil & English Support', desc: 'தமிழ் மொழியில் உள்ள ரசீதுகளையும் படிக்கும். Full bilingual support!' },
            { icon: '📊', title: 'Visual Analytics', desc: 'See beautiful charts of your spending patterns by category and date' },
            { icon: '💰', title: 'Budget Alerts', desc: 'Set monthly limits and get push notifications before you overspend' },
            { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes with beautiful dark mode support across all pages' },
            { icon: '📱', title: 'Mobile Friendly', desc: 'Works perfectly on phones, tablets and desktops with bottom navigation' },
            { icon: '📥', title: 'Export Reports', desc: 'Download your expenses as CSV for tax filing or accountant sharing' },
            { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication keeps your financial data safe and private' },
            { icon: '⚡', title: 'Fast & Free', desc: 'No subscriptions, no hidden costs. Built on open source technology' }
          ].map((f, i) => (
            <div key={i} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderTop: '3px solid #667eea'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#212529', margin: '0 0 8px' }}>
                {f.title}
              </h3>
              <p style={{ color: '#6c757d', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TAMIL HIGHLIGHT ===== */}
      <div style={{
        padding: '80px 30px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>🇮🇳</div>
        <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 16px', color: 'white' }}>
          Supports Tamil & English Receipts
        </h2>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '600px',
          margin: '0 auto 16px',
          lineHeight: '1.7'
        }}>
          தமிழ் மொழியில் உள்ள ரசீதுகளையும் எங்கள் OCR engine படிக்கும்.
        </p>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '500px',
          margin: '0 auto 36px'
        }}>
          Upload receipts in Tamil or English — our AI handles both languages automatically!
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '16px 36px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
        >
          Try It Free →
        </button>
      </div>

      {/* ===== CTA SECTION ===== */}
      <div style={{
        padding: '80px 30px',
        background: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#212529', margin: '0 0 16px' }}>
          Ready to Track Smarter?
        </h2>
        <p style={{ color: '#6c757d', fontSize: '16px', margin: '0 0 36px' }}>
          Join now and start tracking expenses in minutes. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
            }}
          >
            Create Free Account →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 36px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Login to Account
          </button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: '#212529',
        padding: '40px 30px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>💳</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#adb5bd' }}>ExpenseTrack</span>
        </div>
        <p style={{ color: '#6c757d', fontSize: '13px', margin: '0 0 8px' }}>
          Built with ❤️ using MERN Stack • Tesseract OCR • AI Categorization
        </p>
        <p style={{ color: '#6c757d', fontSize: '13px', margin: 0 }}>
          © 2026 ExpenseTrack. All rights reserved.
        </p>
      </footer>

    </div>
  );
}