'use client';

import { useState, useEffect } from 'react';
import { X, Youtube, Mail, ArrowRight, Star, Sparkles, PlayCircle } from 'lucide-react';

/* ─────────────────────────────────────────────────
   Card 1 – YouTube Tutorial Popup
───────────────────────────────────────────────── */
function TutorialCard({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 320);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: `rgba(0,0,0,${visible ? 0.65 : 0})`,
        backdropFilter: `blur(${visible ? 8 : 0}px)`,
        transition: 'background-color 0.32s ease, backdrop-filter 0.32s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)',
          border: '1px solid rgba(139,92,246,0.35)',
          boxShadow: '0 30px 80px rgba(99,51,255,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.94)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.32s ease',
        }}
      >
        {/* Gradient header strip */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #06b6d4 100%)',
          padding: '1.5rem 1.5rem 1rem',
          position: 'relative',
        }}>
          {/* Floating orbs */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '10%', width: 70, height: 70,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close tutorial popup"
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <X size={15} />
          </button>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={12} color="#fde68a" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fde68a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Getting Started Guide
            </span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25 }}>
            New to CampusGrid?
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 0 }}>
            Watch our quick tutorial to unlock the full power of the platform
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Video thumbnail-style CTA */}
          <a
            href="https://youtu.be/ivZ4YrQFR4s?si=hpviWAu1Zd_dh4yf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textDecoration: 'none',
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(239,68,68,0.25)',
              marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(239,68,68,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1rem 1.25rem' }}>
              {/* YouTube icon block */}
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(239,68,68,0.4)',
              }}>
                <PlayCircle size={28} color="#fff" fill="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>
                  CampusGrid Full Walkthrough
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Youtube size={11} color="#ff4444" />
                  <span>YouTube Tutorial • Click to watch</span>
                </div>
              </div>
              <ArrowRight size={18} color="rgba(255,255,255,0.4)" />
            </div>
          </a>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
            {[
              { step: '01', text: 'Learn how each role portal works' },
              { step: '02', text: 'Set up your profile & readiness score' },
              { step: '03', text: 'Explore AI features & live drive notices' },
            ].map(({ step, text }) => (
              <div key={step} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.6rem 0.875rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: '#a78bfa',
                  minWidth: 28, textAlign: 'center', letterSpacing: '0.05em',
                }}>{step}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Watch now button */}
          <a
            href="https://youtu.be/ivZ4YrQFR4s?si=hpviWAu1Zd_dh4yf"
            target="_blank"
            rel="noopener noreferrer"
            id="tutorial-watch-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '0.85rem',
              borderRadius: 14, textDecoration: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              boxShadow: '0 8px 24px rgba(239,68,68,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(239,68,68,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(239,68,68,0.35)';
            }}
          >
            <Youtube size={18} />
            Watch Tutorial on YouTube
          </a>

          {/* Dismiss */}
          <button
            onClick={handleClose}
            style={{
              display: 'block', margin: '0.875rem auto 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'rgba(255,255,255,0.35)',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Card 2 – Contact / Credentials Support Popup
───────────────────────────────────────────────── */
function ContactCard({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 320);
  }

  const MAIL = 'rahulprasadcoding01@gmail.com';
  const WA_NUMBER = '919040786464';
  const WA_MESSAGE = encodeURIComponent('Hi! I need my CampusGrid account credentials. Please help.');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backgroundColor: `rgba(0,0,0,${visible ? 0.65 : 0})`,
        backdropFilter: `blur(${visible ? 8 : 0}px)`,
        transition: 'background-color 0.32s ease, backdrop-filter 0.32s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 460,
          borderRadius: 24, overflow: 'hidden',
          background: 'linear-gradient(160deg, #0a0a1a 0%, #0e1120 40%, #0a1628 100%)',
          border: '1px solid rgba(56,189,248,0.2)',
          boxShadow: '0 30px 80px rgba(6,182,212,0.25), 0 0 0 1px rgba(255,255,255,0.03)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.94)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.32s ease',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 60%, #8b5cf6 100%)',
          padding: '1.5rem 1.5rem 1.1rem',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />

          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close contact popup"
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <X size={15} />
          </button>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '0.75rem',
          }}>
            <Star size={11} color="#fbbf24" fill="#fbbf24" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fde68a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Account Access
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25 }}>
            Need Your Login Credentials?
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 4, marginBottom: 0 }}>
            Reach out directly — we'll set up your account within 24 hours
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Info box */}
          <div style={{
            padding: '0.875rem 1rem', borderRadius: 12, marginBottom: '1.25rem',
            background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.18)',
          }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
              To use <strong style={{ color: 'rgba(255,255,255,0.85)' }}>all role portals</strong> — Student, TPO Admin, Recruiter, and Mentor — please contact the developer with your{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>name, role, and institution</strong>. You'll receive your credentials promptly via the same channel.
            </p>
          </div>

          {/* Contact buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Email */}
            <a
              href={`mailto:${MAIL}?subject=CampusGrid Account Credentials Request&body=Hi Rahul,%0A%0AI'd like to request my CampusGrid account credentials.%0A%0AName: %0ARole: (Student / TPO Admin / Recruiter / Mentor)%0AInstitution: %0A%0AThank you!`}
              id="contact-mail-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '1rem 1.125rem', borderRadius: 14, textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.06))',
                border: '1px solid rgba(99,102,241,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(99,102,241,0.25)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.6)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)';
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(99,102,241,0.4)',
              }}>
                <Mail size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>
                  Send an Email
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>
                  {MAIL}
                </div>
              </div>
              <ArrowRight size={16} color="rgba(255,255,255,0.3)" />
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              id="contact-whatsapp-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '1rem 1.125rem', borderRadius: 14, textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(37,211,102,0.15), rgba(37,211,102,0.04))',
                border: '1px solid rgba(37,211,102,0.25)',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(37,211,102,0.2)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,211,102,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,211,102,0.25)';
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(37,211,102,0.35)',
              }}>
                {/* Official WhatsApp SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="white"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>
                  Chat on WhatsApp
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>
                  +90 9040786464
                </div>
              </div>
              <ArrowRight size={16} color="rgba(255,255,255,0.3)" />
            </a>
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: '1.25rem', padding: '0.75rem 1rem', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Response time is typically <strong style={{ color: 'rgba(255,255,255,0.6)' }}>under 24 hours</strong>. You'll receive your login details securely.
            </p>
          </div>

          <button
            onClick={handleClose}
            style={{
              display: 'block', margin: '1rem auto 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'rgba(255,255,255,0.3)',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Orchestrator – renders Card1, then Card2
───────────────────────────────────────────────── */
export default function HomePopups() {
  const [step, setStep] = useState<'tutorial' | 'contact' | 'done'>('tutorial');

  if (step === 'done') return null;
  if (step === 'tutorial') return <TutorialCard onClose={() => setStep('contact')} />;
  return <ContactCard onClose={() => setStep('done')} />;
}
