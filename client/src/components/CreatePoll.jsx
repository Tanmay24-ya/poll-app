import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { FaPlus, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { getUserId } from '../utils/auth';

const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );

        gsap.fromTo(formRef.current.children,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, stagger: 0.1, duration: 0.4, delay: 0.2 }
        );
    }, []);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
        // Small animation for new input finding its place could go here, 
        // but React re-renders might make it tricky without more complex setup.
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanOptions = options.map(opt => opt.trim()).filter(opt => opt !== '');

        if (!question.trim()) return alert('Question is required');
        if (cleanOptions.length < 2) return alert('At least 2 valid options required');

        try {
            const res = await axios.post('http://localhost:5000/api/polls', { // Ensure this matches your server port
                question,
                options: cleanOptions,
                creatorId: getUserId()
            });

            // Animate out before navigating
            gsap.to(containerRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => navigate(`/poll/${res.data._id}`)
            });

        } catch (err) {
            console.error(err);
            alert('Failed to create poll. Is the server running?');
        }
    };

    return (
        <div ref={containerRef} className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <button
                onClick={() => navigate('/')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <FaArrowLeft /> Back to Home
            </button>

            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Create a Poll</h1>

            <form ref={formRef} onSubmit={handleSubmit}>
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>Question</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What would you like to ask?"
                        required
                        autoFocus
                    />
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Options</label>
                    {options.map((opt, i) => (
                        <div key={i} style={{ marginBottom: '0.75rem' }}>
                            <input
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                required={i < 2}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={addOption} className="btn btn-secondary">
                        <FaPlus /> Option
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        Create Poll <FaArrowRight />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePoll;