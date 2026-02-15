import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/auth';
import { FaPoll, FaChartBar, FaArrowLeft, FaClock, FaCheckCircle, FaPen } from 'react-icons/fa';
import gsap from 'gsap';

const MyPolls = () => {
    const [createdPolls, setCreatedPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('created'); // 'created' or 'voted'
    const navigate = useNavigate();
    const userId = getUserId();
    const listRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [createdRes, votedRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/polls/user/${userId}`).catch(err => ({ data: [] })),
                    axios.get(`http://localhost:5000/api/polls/voted/${userId}`).catch(err => ({ data: [] }))
                ]);

                setCreatedPolls(createdRes.data || []);
                setVotedPolls(votedRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    useEffect(() => {
        if (!loading && listRef.current) {
            gsap.fromTo(listRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, clearProps: 'all' }
            );
        }
    }, [loading, activeTab]);

    const activeList = activeTab === 'created' ? createdPolls : votedPolls;

    return (
        <div style={{ width: '100%', maxWidth: '800px', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FaArrowLeft /> Back
                </button>
                <h1 style={{ fontSize: '2rem', margin: 0, background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    My Polls
                </h1>
                <div style={{ width: '60px' }}></div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button
                    onClick={() => setActiveTab('created')}
                    style={{
                        background: activeTab === 'created' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        color: activeTab === 'created' ? '#a78bfa' : 'var(--text-secondary)',
                        border: activeTab === 'created' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaPen size={14} /> Created ({createdPolls.length})
                </button>
                <button
                    onClick={() => setActiveTab('voted')}
                    style={{
                        background: activeTab === 'voted' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                        color: activeTab === 'voted' ? '#f472b6' : 'var(--text-secondary)',
                        border: activeTab === 'voted' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaCheckCircle size={14} /> Voted ({votedPolls.length})
                </button>
            </div>

            {loading ? (
                <div className="center-all" style={{ minHeight: '200px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : activeList.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaPoll style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ marginBottom: '1rem' }}>
                        {activeTab === 'created' ? 'No polls created yet' : 'No votes yet'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {activeTab === 'created' ? 'Start by creating your first poll.' : 'Vote on polls to see them here.'}
                    </p>
                    {activeTab === 'created' && (
                        <button className="btn btn-primary" onClick={() => navigate('/create')}>
                            Create Poll
                        </button>
                    )}
                </div>
            ) : (
                <div ref={listRef} style={{ display: 'grid', gap: '1rem' }}>
                    {activeList.map((poll) => {
                        const totalVotes = poll.options ? poll.options.reduce((acc, opt) => acc + opt.votes, 0) : 0;
                        return (
                            <div
                                key={poll._id}
                                className="card poll-card"
                                onClick={() => navigate(`/poll/${poll._id}`)}
                                style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    borderLeft: activeTab === 'created' ? '4px solid #8b5cf6' : '4px solid #ec4899'
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{poll.question}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaChartBar /> {totalVotes} votes
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaClock /> {new Date(poll.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    background: activeTab === 'created' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                    color: activeTab === 'created' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontWeight: '500',
                                    fontSize: '0.9rem'
                                }}>
                                    {activeTab === 'created' ? 'Owner' : 'Voted'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyPolls;
