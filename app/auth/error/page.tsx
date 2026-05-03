// app/auth/error/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function ErrorClient({ errorMessage }: { errorMessage: string }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .error-root {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #F5F5FF 0%, #E8E8FF 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .error-card {
          max-width: 500px;
          width: 100%;
          background: white;
          border-radius: 24px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 24px 64px rgba(91, 91, 214, 0.12);
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .error-icon svg {
          width: 40px;
          height: 40px;
        }

        .error-title {
          font-size: 28px;
          font-weight: 800;
          color: #DC2626;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .error-message {
          font-size: 16px;
          color: #4B4B6B;
          line-height: 1.6;
          margin-bottom: 32px;
          padding: 0 16px;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #5B5BD6 0%, #6d3db5 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(91, 91, 214, 0.25);
        }

        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(91, 91, 214, 0.35);
          opacity: 0.95;
        }

        .back-button:active {
          transform: translateY(0);
        }

        .back-button svg {
          width: 18px;
          height: 18px;
        }

        .additional-info {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #EBEBF5;
          font-size: 13px;
          color: #9595BB;
        }

        .additional-info a {
          color: #5B5BD6;
          text-decoration: none;
          font-weight: 600;
        }

        .additional-info a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .error-card {
            padding: 32px 24px;
          }
          
          .error-title {
            font-size: 24px;
          }
          
          .error-message {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="error-root">
        <div className="error-card">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className="error-title">Account Already Exists</h1>
          
          <p className="error-message">
            {errorMessage}
          </p>
          
          <button onClick={handleGoBack} className="back-button">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Login
          </button>
          
          <div className="additional-info">
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          </div>
        </div>
      </div>
    </>
  );
}