import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { FaPoll, FaChartBar, FaRocket } from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const shapesRef = useRef([]);

    useEffect(() => {
        // Hero Animation
        gsap.fromTo(heroRef.current.children,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power3.out' }
        );

        // Floating Shapes Animation
        shapesRef.current.forEach((shape, i) => {
            gsap.to(shape, {
                y: 'random(-20, 20)',
                x: 'random(-20, 20)',
                rotation: 'random(-15, 15)',
                duration: 'random(2, 4)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.5
            });
        });
    }, []);

    const addToRefs = (el) => {
        if (el && !shapesRef.current.includes(el)) {
            shapesRef.current.push(el);
        }
    };

    return (
        <div className="center-all" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background Shapes */}
            <div
                ref={addToRefs}
                style={{
                    position: 'absolute', top: '10%', left: '5%',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%', filter: 'blur(40px)', zIndex: -1
                }}
            />
            <div
                ref={addToRefs}
                style={{
                    position: 'absolute', bottom: '10%', right: '5%',
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%', filter: 'blur(50px)', zIndex: -1
                }}
            />

            <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                <div ref={heroRef}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            color: '#a78bfa',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }}></span>
                            Live Polling System
                        </div>
                    </div>

                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: '1.1' }}>
                        Instant Feedback, <br />
                        <span style={{
                            background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Real-Time Insights</span>
                    </h1>

                    <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem', color: '#9ca3af' }}>
                        Create dynamic polls in seconds, share with your audience, and watch the results update live. No registration required.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/create')}
                            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                        >
                            <FaRocket /> Start New Poll
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                            onClick={() => navigate('/my-polls')}
                        >
                            <FaPoll /> My Polls
                        </button>
                    </div>

                    <div style={{
                        marginTop: '4rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem',
                        textAlign: 'left'
                    }}>
                        <FeatureCard
                            icon={<FaRocket style={{ color: '#8b5cf6' }} />}
                            title="Lightning Fast"
                            desc="Create and share polls instantly without any friction."
                        />
                        <FeatureCard
                            icon={<FaChartBar style={{ color: '#ec4899' }} />}
                            title="Live Analytics"
                            desc="Watch votes roll in real-time with smooth animations."
                        />
                        <FeatureCard
                            icon={<FaPoll style={{ color: '#3b82f6' }} />}
                            title="Fully Anonymous"
                            desc="Honest feedback driven by complete user anonymity."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f3f4f6' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>{desc}</p>
    </div>
);

export default LandingPage;
