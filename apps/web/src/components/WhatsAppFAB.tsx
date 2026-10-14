'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Floating WhatsApp Action Button (FAB)
 * Shows only for students — opens the CampusGrid WhatsApp bot
 * with a pre-filled "hi" message on click.
 */
export default function WhatsAppFAB() {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Only show for students
    if (user?.role === 'student') {
      // Delay entrance for smooth animation
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!visible) return null;

  // Meta test number — replace with production number when going live
  const whatsappNumber = '15556599529';
  const prefilledMessage = encodeURIComponent('hi');
  const waLink = `https://wa.me/${whatsappNumber}?text=${prefilledMessage}`;

  return (
    <>
      <style>{`
        @keyframes wa-fab-enter {
          from {
            opacity: 0;
            transform: scale(0.3) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes wa-pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .wa-fab {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 40;
          animation: wa-fab-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media (min-width: 768px) {
          .wa-fab {
            bottom: 32px;
            right: 32px;
          }
        }
        .wa-fab-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4), 0 2px 8px rgba(0,0,0,0.15);
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }
        .wa-fab-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(37, 211, 102, 0.5), 0 4px 12px rgba(0,0,0,0.2);
        }
        .wa-fab-btn:active {
          transform: scale(0.95);
        }
        .wa-fab-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.4);
          animation: wa-pulse-ring 2s ease-out infinite;
        }
        .wa-fab-btn svg {
          position: relative;
          z-index: 1;
          width: 32px;
          height: 32px;
          fill: white;
        }
        .wa-tooltip {
          position: absolute;
          right: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: var(--card-bg, #1e293b);
          color: var(--foreground, #fff);
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .wa-tooltip.show {
          opacity: 1;
        }
        .wa-tooltip::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid var(--card-bg, #1e293b);
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
        }
      `}</style>

      <div className="wa-fab">
        <div className={`wa-tooltip ${showTooltip ? 'show' : ''}`}>
          💬 Chat with CampusGrid Bot
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-fab-btn"
          id="whatsapp-fab-button"
          aria-label="Chat with CampusGrid on WhatsApp"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* WhatsApp Icon */}
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </>
  );
}
