import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Check, Clock, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const API_BASE = 'https://exam-nytw.onrender.com/api';

const ExamSystem = () => {
  const [view, setView] = useState('admin');
  const [questions, setQuestions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examComplete, setExamComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalExamTime, setTotalExamTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timeLimit: 30
  });

  useEffect(() => {
    loadQuestions();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (view === 'exam' && !examComplete && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, examComplete, timeRemaining]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log('Loaded questions from backend:', data);
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
      console.log('Backend not connected, starting with empty questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt)) {
      alert('Please fill all fields');
      return;
    }

    if (newQuestion.timeLimit < 10 || newQuestion.timeLimit > 300) {
      alert('Time limit must be between 10 and 300 seconds');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      
      const data = await response.json();
      setQuestions([...questions, data]);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30
      });
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question. Make sure backend is running!');
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/questions/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      
      setQuestions(questions.filter(q => q._id !== id));
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Make sure backend is running!');
    }
  };

  const startExam = () => {
    if (questions.length === 0) {
      alert('No questions available!');
      return;
    }
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const totalTime = shuffled.reduce((sum, q) => sum + (q.timeLimit || 30), 0);
    
    setExamQuestions(shuffled);
    setTotalExamTime(totalTime);
    setTimeRemaining(totalTime);
    setCurrentIndex(0);
    setAnswers({});
    setExamComplete(false);
    setScore(0);
    setView('exam');
  };

  const selectAnswer = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentIndex]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishExam();
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishExam = () => {
    let correct = 0;
    examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setExamComplete(true);
  };

  const resetExam = () => {
    setView('admin');
    setExamQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setExamComplete(false);
    setScore(0);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (view === 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)',
        padding: isMobile ? '1rem' : '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '16px' : '24px',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
            padding: isMobile ? '1.5rem' : '3rem',
            marginBottom: isMobile ? '1.5rem' : '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '1rem' : '0',
              marginBottom: isMobile ? '1.5rem' : '2rem'
            }}>
              <div>
                <h1 style={{
                  fontSize: isMobile ? '1.75rem' : '3rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  Exam Management
                </h1>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: isMobile ? '0.9rem' : '1.1rem' 
                }}>
                  Create and manage your exam questions
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                color: 'white',
                padding: isMobile ? '1rem 1.5rem' : '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)',
                textAlign: 'center',
                minWidth: '120px'
              }}>
                <div style={{ 
                  fontSize: '0.85rem', 
                  opacity: 0.9, 
                  marginBottom: '0.25rem' 
                }}>
                  Total Questions
                </div>
                <div style={{ 
                  fontSize: isMobile ? '1.75rem' : '2rem', 
                  fontWeight: 'bold' 
                }}>
                  {questions.length}
                </div>
              </div>
            </div>
            
            {/* Add Question Form */}
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff, #fce7f3)',
              borderRadius: isMobile ? '16px' : '20px',
              padding: isMobile ? '1.5rem' : '2rem',
              marginBottom: isMobile ? '1.5rem' : '2rem',
              border: '2px solid #e9d5ff'
            }}>
              <h2 style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 'bold',
                color: '#581c87',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Plus size={isMobile ? 20 : 24} style={{ color: '#9333ea' }} /> Add New Question
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}>
                    Question
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.875rem' : '1rem',
                      border: '2px solid #e9d5ff',
                      borderRadius: '12px',
                      fontSize: isMobile ? '0.95rem' : '1rem',
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}>
                    Time Limit (seconds)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock style={{ 
                      position: 'absolute', 
                      left: isMobile ? '0.875rem' : '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9333ea' 
                    }} size={isMobile ? 18 : 20} />
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={newQuestion.timeLimit}
                      onChange={(e) => setNewQuestion({...newQuestion, timeLimit: parseInt(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: isMobile ? '0.875rem' : '1rem',
                        paddingLeft: isMobile ? '2.75rem' : '3rem',
                        border: '2px solid #e9d5ff',
                        borderRadius: '12px',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                      onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                    />
                  </div>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: '#6b7280', 
                    marginTop: '0.25rem' 
                  }}>
                    Between 10 and 300 seconds
                  </p>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.75rem' 
                  }}>
                    Options (select correct answer)
                  </label>
                  {newQuestion.options.map((option, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.625rem' 
                    }}>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === idx}
                        onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => {
                          const opts = [...newQuestion.options];
                          opts[idx] = e.target.value;
                          setNewQuestion({...newQuestion, options: opts});
                        }}
                        style={{
                          flex: 1,
                          padding: isMobile ? '0.875rem' : '1rem',
                          border: '2px solid #e9d5ff',
                          borderRadius: '12px',
                          fontSize: isMobile ? '0.95rem' : '1rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                        onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={addQuestion}
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  color: 'white',
                  padding: isMobile ? '0.875rem' : '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 25px rgba(147, 51, 234, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus size={isMobile ? 20 : 24} /> Add Question
              </button>
            </div>

            {/* Questions List */}
            <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
              <h2 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.5rem', 
                fontWeight: 'bold', 
                color: '#581c87', 
                marginBottom: '1rem' 
              }}>
                Question Bank
              </h2>
              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: isMobile ? '3rem 1.5rem' : '4rem 2rem',
                  background: '#f9fafb',
                  borderRadius: isMobile ? '16px' : '20px',
                  border: '2px dashed #d1d5db'
                }}>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: isMobile ? '1rem' : '1.1rem' 
                  }}>
                    Loading questions...
                  </p>
                </div>
              ) : questions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: isMobile ? '3rem 1.5rem' : '4rem 2rem',
                  background: '#f9fafb',
                  borderRadius: isMobile ? '16px' : '20px',
                  border: '2px dashed #d1d5db'
                }}>
                  <AlertCircle 
                    size={isMobile ? 48 : 64} 
                    style={{ margin: '0 auto 1rem', color: '#9ca3af' }} 
                  />
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: isMobile ? '0.95rem' : '1.1rem' 
                  }}>
                    No questions yet. Add your first question above!
                  </p>
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: '0.8rem', 
                    marginTop: '0.5rem' 
                  }}>
                    Backend connected to Render
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {questions.map((q, idx) => (
                    <div key={q._id} style={{
                      background: 'white',
                      border: '2px solid #f3e8ff',
                      borderRadius: isMobile ? '16px' : '20px',
                      padding: isMobile ? '1.25rem' : '1.5rem',
                      boxShadow: '0 4px 15px rgba(147, 51, 234, 0.1)',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#d8b4fe';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(147, 51, 234, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#f3e8ff';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.1)';
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '1rem',
                        gap: '0.75rem'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            marginBottom: '0.5rem',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              background: 'linear-gradient(to right, #9333ea, #ec4899)',
                              color: 'white',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap'
                            }}>
                              Q{idx + 1}
                            </span>
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: '#9333ea',
                              background: '#faf5ff',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              <Clock size={12} /> {q.timeLimit}s
                            </span>
                          </div>
                          <h3 style={{ 
                            fontWeight: 'bold', 
                            color: '#111827', 
                            fontSize: isMobile ? '0.95rem' : '1.1rem',
                            wordBreak: 'break-word'
                          }}>
                            {q.question}
                          </h3>
                        </div>
                        <button
                          onClick={() => deleteQuestion(q._id)}
                          style={{
                            color: '#ef4444',
                            background: 'transparent',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            flexShrink: 0
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                        gap: '0.625rem' 
                      }}>
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            style={{
                              padding: '0.625rem',
                              borderRadius: '10px',
                              fontWeight: '500',
                              fontSize: '0.875rem',
                              wordBreak: 'break-word',
                              ...(optIdx === q.correctAnswer ? {
                                background: 'linear-gradient(to right, #d1fae5, #a7f3d0)',
                                color: '#065f46',
                                border: '2px solid #6ee7b7'
                              } : {
                                background: '#f9fafb',
                                color: '#374151',
                                border: '1px solid #e5e7eb'
                              })
                            }}
                          >
                            <span style={{ fontWeight: 'bold' }}>
                              {String.fromCharCode(65 + optIdx)}.
                            </span> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Exam Button */}
            <button
              onClick={startExam}
              disabled={questions.length === 0}
              style={{
                width: '100%',
                background: questions.length === 0 ? '#9ca3af' : 'linear-gradient(to right, #10b981, #059669)',
                color: 'white',
                padding: isMobile ? '1rem' : '1.25rem',
                borderRadius: isMobile ? '16px' : '20px',
                border: 'none',
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                fontWeight: 'bold',
                cursor: questions.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: questions.length === 0 ? 'none' : '0 10px 30px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.2s',
                opacity: questions.length === 0 ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (questions.length > 0) e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={isMobile ? 24 : 28} /> Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam Complete View
  if (examComplete) {
    const percentage = Math.round((score / examQuestions.length) * 100);
    const timeTaken = totalExamTime - timeRemaining;
    const wrongAnswers = examQuestions.length - score;
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dbeafe 0%, #fae8ff 100%)',
        padding: isMobile ? '1rem' : '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Summary Cards */}
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '16px' : '24px',
            boxShadow: '0 25px 70px rgba(139, 92, 246, 0.4)',
            padding: isMobile ? '2rem 1.5rem' : '3rem',
            marginBottom: isMobile ? '1.5rem' : '2rem',
            border: '4px solid #e9d5ff',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
              <div style={{
                margin: '0 auto',
                width: isMobile ? '96px' : '128px',
                height: isMobile ? '96px' : '128px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                background: percentage >= 70 ? '#d1fae5' : percentage >= 50 ? '#fef3c7' : '#fee2e2'
              }}>
                <Check size={isMobile ? 60 : 80} style={{
                  color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'
                }} />
              </div>
              <h1 style={{
                fontSize: isMobile ? '2rem' : '3.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Exam Complete!
              </h1>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              marginBottom: isMobile ? '1.5rem' : '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.5rem',
                border: '2px solid #bfdbfe'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.25rem' }}>Total Questions</div>
                <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>{examQuestions.length}</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.5rem',
                border: '2px solid #6ee7b7'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#065f46', marginBottom: '0.25rem' }}>✅ Correct</div>
                <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 'bold', color: '#047857' }}>{score}</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.5rem',
                border: '2px solid #fca5a5'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.25rem' }}>❌ Wrong</div>
                <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 'bold', color: '#7f1d1d' }}>{wrongAnswers}</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #faf5ff, #fce7f3)',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.5rem',
                border: '2px solid #e9d5ff'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9333ea', marginBottom: '0.25rem' }}>Percentage</div>
                <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 'bold', color: '#7e22ce' }}>{percentage}%</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.5rem',
                border: '2px solid #fcd34d',
                gridColumn: isMobile ? 'span 2' : 'auto'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem' }}>⏱️ Time Taken</div>
                <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 'bold', color: '#78350f' }}>{formatTime(timeTaken)}</div>
              </div>
            </div>
            
            <div style={{
              fontSize: isMobile ? '1.1rem' : '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              background: percentage >= 70 ? '#d1fae5' : percentage >= 50 ? '#fef3c7' : '#fee2e2',
              color: percentage >= 70 ? '#065f46' : percentage >= 50 ? '#92400e' : '#991b1b'
            }}>
              {percentage >= 70 ? '🎉 Excellent Performance!' : 
               percentage >= 50 ? '👍 Good Effort!' : 
               '💪 Keep Practicing!'}
            </div>
            
            <button
              onClick={resetExam}
              style={{
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: 'white',
                padding: isMobile ? '1rem 2rem' : '1.25rem 3rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Back to Dashboard
            </button>
          </div>

          {/* Detailed Answer Review */}
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '16px' : '24px',
            boxShadow: '0 20px 50px rgba(139, 92, 246, 0.3)',
            padding: isMobile ? '1.5rem' : '2.5rem',
            border: '2px solid #e9d5ff'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              color: '#581c87',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              📝 Answer Review
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {examQuestions.map((q, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.correctAnswer;
                
                return (
                  <div key={idx} style={{
                    border: `3px solid ${isCorrect ? '#6ee7b7' : '#fca5a5'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '1rem' : '1.5rem',
                    background: isCorrect ? 'linear-gradient(135deg, #f0fdf4, #d1fae5)' : 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                  }}>
                    {/* Question Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        width: isMobile ? '40px' : '48px',
                        height: isMobile ? '40px' : '48px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '1rem' : '1.2rem',
                        background: isCorrect ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #ef4444, #dc2626)',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                          Question {idx + 1}
                        </div>
                        <h3 style={{ 
                          fontSize: isMobile ? '1rem' : '1.2rem', 
                          fontWeight: 'bold', 
                          color: '#111827', 
                          margin: 0,
                          wordBreak: 'break-word'
                        }}>
                          {q.question}
                        </h3>
                      </div>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {q.options.map((option, optIdx) => {
                        const isUserAnswer = userAnswer === optIdx;
                        const isCorrectAnswer = q.correctAnswer === optIdx;
                        
                        let bgColor = 'white';
                        let borderColor = '#e5e7eb';
                        let textColor = '#374151';
                        let icon = '';
                        
                        if (isCorrectAnswer) {
                          bgColor = '#d1fae5';
                          borderColor = '#6ee7b7';
                          textColor = '#065f46';
                          icon = '✓';
                        }
                        
                        if (isUserAnswer && !isCorrect) {
                          bgColor = '#fee2e2';
                          borderColor = '#fca5a5';
                          textColor = '#991b1b';
                          icon = '✗';
                        }
                        
                        return (
                          <div key={optIdx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: isMobile ? '0.75rem' : '1rem',
                            borderRadius: '10px',
                            border: `2px solid ${borderColor}`,
                            background: bgColor,
                            color: textColor
                          }}>
                            <div style={{
                              width: isMobile ? '28px' : '32px',
                              height: isMobile ? '28px' : '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              background: isCorrectAnswer || isUserAnswer ? textColor : '#f3f4f6',
                              color: isCorrectAnswer || isUserAnswer ? 'white' : '#6b7280',
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span style={{ 
                              flex: 1, 
                              fontWeight: '500', 
                              fontSize: isMobile ? '0.875rem' : '1rem',
                              wordBreak: 'break-word'
                            }}>
                              {option}
                            </span>
                            {icon && (
                              <div style={{
                                fontSize: isMobile ? '1.25rem' : '1.5rem',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {icon}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Message */}
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.625rem 1rem',
                      borderRadius: '8px',
                      background: isCorrect ? '#d1fae5' : '#fee2e2',
                      color: isCorrect ? '#065f46' : '#991b1b',
                      fontSize: isMobile ? '0.85rem' : '0.95rem',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {isCorrect ? (
                        '🎉 Correct Answer!'
                      ) : userAnswer === undefined ? (
                        '⚠️ Not Answered'
                      ) : (
                        `❌ Wrong Answer - Correct answer is ${String.fromCharCode(65 + q.correctAnswer)}`
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exam View
  const current = examQuestions[currentIndex];
  const progress = ((currentIndex + 1) / examQuestions.length) * 100;
  const isTimeWarning = timeRemaining <= 60;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      padding: isMobile ? '1rem' : '2rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Timer Header */}
        <div style={{
          marginBottom: '1rem',
          padding: isMobile ? '1rem' : '1.5rem',
          borderRadius: isMobile ? '16px' : '20px',
          boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)',
          border: '2px solid',
          borderColor: isTimeWarning ? '#fca5a5' : '#c7d2fe',
          background: isTimeWarning ? '#fee2e2' : 'white',
          animation: isTimeWarning ? 'pulse 1s infinite' : 'none'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={isMobile ? 24 : 32} style={{ color: isTimeWarning ? '#dc2626' : '#6366f1' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280' }}>Time Remaining</div>
                <div style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: 'bold',
                  color: isTimeWarning ? '#dc2626' : '#4f46e5'
                }}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280' }}>Progress</div>
              <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                {currentIndex + 1}/{examQuestions.length}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: isMobile ? '16px' : '24px',
          boxShadow: '0 20px 50px rgba(79, 70, 229, 0.3)',
          padding: isMobile ? '1.5rem' : '2.5rem',
          border: '2px solid #c7d2fe'
        }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.625rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span>Question {currentIndex + 1} of {examQuestions.length}</span>
              <span style={{ color: '#9333ea' }}>Answered: {Object.keys(answers).length}/{examQuestions.length}</span>
            </div>
            <div style={{
              width: '100%',
              background: '#e5e7eb',
              borderRadius: '9999px',
              height: isMobile ? '12px' : '16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div
                style={{
                  background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  height: isMobile ? '12px' : '16px',
                  borderRadius: '9999px',
                  width: `${progress}%`,
                  transition: 'width 0.5s',
                  boxShadow: '0 2px 8px rgba(147, 51, 234, 0.4)'
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem', 
              marginBottom: '1.25rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: 'white',
                padding: isMobile ? '0.375rem 0.875rem' : '0.5rem 1rem',
                borderRadius: '10px',
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)',
                flexShrink: 0
              }}>
                Q{currentIndex + 1}
              </span>
              <h2 style={{
                fontSize: isMobile ? '1.25rem' : '1.75rem',
                fontWeight: 'bold',
                color: '#111827',
                flex: 1,
                minWidth: 0,
                wordBreak: 'break-word',
                margin: 0
              }}>
                {current.question}
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {current.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  style={{
                    textAlign: 'left',
                    padding: isMobile ? '1rem' : '1.25rem',
                    borderRadius: '14px',
                    border: answers[currentIndex] === idx ? '3px solid #9333ea' : '2px solid #e5e7eb',
                    background: answers[currentIndex] === idx ? 'linear-gradient(to right, #faf5ff, #fce7f3)' : 'white',
                    cursor: 'pointer',
                    boxShadow: answers[currentIndex] === idx ? '0 8px 25px rgba(147, 51, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s',
                    transform: answers[currentIndex] === idx ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseOver={(e) => {
                    if (answers[currentIndex] !== idx) {
                      e.currentTarget.style.borderColor = '#d8b4fe';
                      e.currentTarget.style.background = '#faf5ff';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (answers[currentIndex] !== idx) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: isMobile ? '36px' : '40px',
                      height: isMobile ? '36px' : '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.95rem' : '1.1rem',
                      background: answers[currentIndex] === idx ? 'linear-gradient(to right, #9333ea, #ec4899)' : '#f3f4f6',
                      color: answers[currentIndex] === idx ? 'white' : '#374151',
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span style={{ 
                      fontSize: isMobile ? '0.95rem' : '1.1rem', 
                      fontWeight: '500', 
                      color: '#1f2937',
                      wordBreak: 'break-word'
                    }}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={previousQuestion}
              disabled={currentIndex === 0}
              style={{
                padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
                border: '2px solid #d8b4fe',
                borderRadius: '12px',
                background: 'transparent',
                color: '#9333ea',
                fontWeight: '600',
                fontSize: isMobile ? '0.9rem' : '1rem',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)',
                transition: 'all 0.3s',
                flex: isMobile ? '1' : 'none'
              }}
              onMouseOver={(e) => {
                if (currentIndex !== 0) e.currentTarget.style.background = '#faf5ff';
              }}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <button
              onClick={nextQuestion}
              style={{
                padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(147, 51, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s',
                flex: isMobile ? '1' : 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {currentIndex === examQuestions.length - 1 ? 'Finish Exam' : 'Next'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSystem;