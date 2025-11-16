import React, { useState, useEffect } from 'react';
import '../styles/home.css';

const HomePage = ({ onStartGame }) => {
  const [scrollY, setScrollY] = useState(0);
  const [worldName, setWorldName] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="homepage">
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div className="hero-gradient"></div>
          <div className="hero-grid"></div>
        </div>
        
        <div className="container hero-content">
          <div className="hero-badge fade-in">
            <span className="badge badge-primary">
              <span className="badge-dot"></span>
              Multi-Agent AI RPG
            </span>
          </div>
          
          <h1 className="hero-title fade-in" style={{ animationDelay: '0.1s' }}>
            Enter Into Your World
          </h1>
          
          <p className="hero-description fade-in" style={{ animationDelay: '0.2s' }}>
            A narrative-driven adventure where your choices shape not just the story,
            but reveal who you truly are. Every decision matters. Every path is unique.
          </p>
          
          <div className="hero-actions fade-in" style={{ animationDelay: '0.3s' }}>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowStartModal(true)}
            >
              <span>Begin Your Journey</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection('features')}
            >
              Learn More
            </button>
          </div>
          
          <div className="hero-stats fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat">
              <div className="stat-value">50</div>
              <div className="stat-label">Turns</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-value">10+</div>
              <div className="stat-label">AI Agents</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-value">∞</div>
              <div className="stat-label">Possibilities</div>
            </div>
          </div>
        </div>
        
        <div className="hero-scroll-indicator">
          <div className="scroll-mouse"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-text">Powered by Advanced AI</h2>
            <p className="section-description">
              10+ specialized AI agents working in concert to create
              a living, breathing world that responds to your choices
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>Hidden Personality Profiling</h3>
              <p>Your choices reveal your true nature. The game learns your personality—aggressive, cautious, diplomatic—without you knowing.</p>
              <div className="feature-tags">
                <span className="badge badge-primary">8 Traits</span>
                <span className="badge badge-primary">Real-time</span>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>NPCs That Remember</h3>
              <p>Characters remember every interaction. Help someone early? They'll remember. Betray trust? They won't forget.</p>
              <div className="feature-tags">
                <span className="badge badge-success">Persistent Memory</span>
                <span className="badge badge-success">Dynamic Trust</span>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Multi-Agent Orchestration</h3>
              <p>10+ specialized AI agents coordinate behind the scenes—World Builder, NPC Manager, Quest Designer, and more.</p>
              <div className="feature-tags">
                <span className="badge badge-warning">10+ Agents</span>
                <span className="badge badge-warning">Coordinated</span>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3>Consequences That Matter</h3>
              <p>Every choice has weight. Decisions from turn 5 echo into turn 45. Build alliances or go solo. Trust or betray.</p>
              <div className="feature-tags">
                <span className="badge badge-danger">Permanent</span>
                <span className="badge badge-danger">Far-reaching</span>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3>Emergent Storytelling</h3>
              <p>No two playthroughs are alike. The story emerges from your personality, your choices, and the world's reaction to you.</p>
              <div className="feature-tags">
                <span className="badge badge-primary">Unique</span>
                <span className="badge badge-primary">Adaptive</span>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>50-Turn Epic Journey</h3>
              <p>5 stages. 50 critical decisions. Side quests, betrayals, and a finale shaped by everything you've done.</p>
              <div className="feature-tags">
                <span className="badge badge-success">5 Stages</span>
                <span className="badge badge-success">30-60 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-text">How It Works</h2>
            <p className="section-description">
              A seamless blend of narrative design and AI intelligence
            </p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Choose Your World</h3>
                <p>Enter any universe you can imagine—pirates, cyberpunk, fantasy, sci-fi. The AI builds a rich world around your choice.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Make Choices</h3>
                <p>Face 4 options each turn. Each mapped to different personality traits, but you won't see the connection.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Watch the World React</h3>
                <p>NPCs remember. Quests adapt. The world changes based on your decisions. Every action has consequences.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>Discover Yourself</h3>
                <p>Halfway through, your personality profile is revealed. Are you aggressive? Diplomatic? Independent? The game knows.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">05</div>
              <div className="step-content">
                <h3>Reach Your Unique Ending</h3>
                <p>The finale is tailored to your playstyle. Your personality determines the outcome. No two endings are the same.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology">
        <div className="container">
          <div className="tech-content">
            <div className="tech-visual">
              <div className="tech-diagram">
                <div className="agent-node orchestrator">
                  <div className="node-pulse"></div>
                  <span>Orchestrator</span>
                </div>
                <div className="agent-connections">
                  <div className="connection"></div>
                  <div className="connection"></div>
                  <div className="connection"></div>
                </div>
                <div className="agent-grid">
                  <div className="agent-node">World</div>
                  <div className="agent-node">NPC</div>
                  <div className="agent-node">Quest</div>
                  <div className="agent-node">Combat</div>
                  <div className="agent-node">Betrayal</div>
                  <div className="agent-node">Profile</div>
                  <div className="agent-node">Dialogue</div>
                  <div className="agent-node">Consequence</div>
                  <div className="agent-node">Inventory</div>
                  <div className="agent-node">Continuity</div>
                </div>
              </div>
            </div>
            
            <div className="tech-info">
              <h2>Built on Advanced AI</h2>
              <p className="tech-description">
                Shadow Council uses a sophisticated multi-agent architecture where
                specialized AI systems work together to create a living story.
              </p>
              
              <ul className="tech-features">
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Claude Sonnet 4 powered</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Optimized API calls (4-5 per turn)</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Local personality tracking (no extra calls)</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Persistent memory across 50 turns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Discover Who You Are?</h2>
            <p>Your choices. Your story. Your truth.</p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowStartModal(true)}
            >
              Begin Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Start Modal */}
      {showStartModal && (
        <div className="modal-overlay" onClick={() => setShowStartModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowStartModal(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2>Enter Your World</h2>
            <p className="modal-description">
              Choose any universe, real or imagined. The AI will build
              a rich, reactive world around your choice.
            </p>
            
            <div className="input-group">
              <label htmlFor="world-input">World / Universe</label>
              <input
                id="world-input"
                type="text"
                value={worldName}
                onChange={e => setWorldName(e.target.value)}
                placeholder="e.g., Pirate Caribbean, Cyberpunk City, Medieval Fantasy..."
                className="text-input"
                autoFocus
                onKeyPress={e => e.key === 'Enter' && worldName && onStartGame(worldName)}
              />
              <small className="input-hint">
                Try: Star Wars, Lord of the Rings, Post-Apocalyptic, Vikings, Noir Detective...
              </small>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowStartModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => worldName && onStartGame(worldName)}
                disabled={!worldName}
              >
                Start Adventure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Shadow Council</h3>
              <p>Multi-Agent AI RPG</p>
            </div>
            <div className="footer-links">
              <a href="#features" onClick={e => { e.preventDefault(); scrollToSection('features'); }}>
                Features
              </a>
              <a href="https://github.com/aryanparab" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer">
                Powered by Claude
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Shadow Council. Built for Claude Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;