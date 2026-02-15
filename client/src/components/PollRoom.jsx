import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import gsap from 'gsap';
import { FaCopy, FaCheckCircle, FaChartPie, FaArrowLeft } from 'react-icons/fa';
import { getUserId } from '../utils/auth';
import { API_BASE_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

const PollRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poll, setPoll] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [votedOption, setVotedOption] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const containerRef = useRef(null);
    const optionsRef = useRef([]);

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/polls/${id}`);
                setPoll(res.data);

                // GSAP Entrance
                gsap.fromTo(containerRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
                );
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load poll');
            }
        };

        const localVote = localStorage.getItem(`voted_${id}`);
        if (localVote) {
            setHasVoted(true);
            // If we stored which option they voted for, we could set it here
            // setVotedOption(localVote); 
        }

        fetchPoll();
        socket.emit('joinPoll', id);

        const handleConnect = () => socket.emit('joinPoll', id);
        socket.on('connect', handleConnect);

        socket.on('pollUpdated', (updatedPoll) => {
            setPoll(updatedPoll);
        });

        return () => {
            socket.off('pollUpdated');
            socket.off('connect', handleConnect);
            socket.off('pollUpdated');
        };
    }, [id]);

    useEffect(() => {
        // Animate bars when poll data changes
        if (poll && optionsRef.current.length > 0) {
            const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

            poll.options.forEach((opt, index) => {
                const percentage = totalVotes === 0 ? 0 : (opt.votes / totalVotes) * 100;

                // Animate valid refs
                const el = optionsRef.current[index];
                if (el) {
                    const bar = el.querySelector('.progress-bar');
                    const percentText = el.querySelector('.percent-text');

                    if (bar) {
                        gsap.to(bar, {
                            width: `${percentage}%`,
                            duration: 0.8,
                            ease: 'power2.out'
                        });
                    }
                    if (percentText) {
                        gsap.to(percentText, {
                            innerText: percentage,
                            snap: { innerText: 0.1 },
                            duration: 0.8,
                            onUpdate: function () {
                                this.targets()[0].innerHTML = Number(this.targets()[0].innerText).toFixed(1) + '%';
                            }
                        });
                    }
                }
            });
        }
    }, [poll]);

    const handleVote = async (optionId) => {
        if (hasVoted) return;

        try {
            await axios.post(`${API_BASE_URL}/api/polls/${id}/vote`, {
                optionId,
                userId: getUserId()
            });
            localStorage.setItem(`voted_${id}`, optionId);
            setHasVoted(true);
            setVotedOption(optionId);

            // Animate selection
            gsap.to(`.option-${optionId}`, {
                scale: 1.02,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });

        } catch (err) {
            alert(err.response?.data?.error || 'Error voting');
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addToRefs = (el) => {
        if (el && !optionsRef.current.includes(el)) {
            optionsRef.current.push(el);
        }
    };

    if (error) return (
        <div className="card" style={{ borderColor: '#ef4444', textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444' }}>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/create')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                Create New Poll
            </button>
        </div>
    );

    if (!poll) return (
        <div className="center-all">
            <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

    return (
        <div ref={containerRef} className="card" style={{ width: '100%', maxWidth: '600px' }}>
            <button
                onClick={() => navigate('/')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <FaArrowLeft /> Back to Home
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{poll.question}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <FaChartPie />
                    <span>{totalVotes} total votes</span>
                </div>
            </div>

            <div className="poll-options-list">
                {poll.options.map((opt, i) => {
                    const isSelected = votedOption === opt._id || localStorage.getItem(`voted_${id}`) === opt._id;

                    return (
                        <div
                            key={opt._id}
                            ref={addToRefs}
                            onClick={() => !hasVoted && handleVote(opt._id)}
                            className={`poll-option option-${opt._id} ${hasVoted ? 'voted' : ''}`}
                            style={{
                                cursor: hasVoted ? 'default' : 'pointer',
                                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
                                background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)'
                            }}
                        >
                            <div className="progress-bar" style={{ width: '0%', background: isSelected ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))' : 'linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))' }} />

                            <div className="option-content" style={{ padding: '0.5rem 0' }}>
                                <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{opt.text}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isSelected && <FaCheckCircle style={{ color: 'var(--accent-primary)' }} />}
                                    <span className="percent-text" style={{ fontVariantNumeric: 'tabular-nums' }}>0.0%</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', width: '40px', textAlign: 'right' }}>
                                        {opt.votes}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Share this poll</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        readOnly
                        value={window.location.href}
                        style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={copyLink}
                        style={{ padding: '0 1.5rem' }}
                    >
                        {copied ? <FaCheckCircle /> : <FaCopy />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PollRoom;