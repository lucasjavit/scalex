import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth-social/context/AuthContext';
import apiService from '../../../services/api';

const Progress = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, lessonId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Get backend user
      const userData = await apiService.getUserByFirebaseUid(user.uid);

      // Load lesson
      const lessonData = await apiService.getEnglishLesson(lessonId);
      setLesson(lessonData);

      // Load progress
      const progressData = await apiService.getLessonProgress(userData.id, lessonId);
      setProgress(progressData);

      // Load recent answer history
      const historyData = await apiService.getAnswerHistory(userData.id, 10);
      // Filter for this lesson only
      const lessonHistory = historyData.filter(
        (h) => h.question?.lessonId === lessonId
      );
      setAnswerHistory(lessonHistory);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !progress) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>Progress data not available</h4>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/english-course')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate('/english-course')}
      >
        ← Back to Dashboard
      </button>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-body text-center py-5">
              <h1 className="display-1">
                {progress.status === 'completed' ? '🎉' : '📚'}
              </h1>
              <h2 className="mb-3">
                {progress.status === 'completed'
                  ? 'Lesson Completed!'
                  : 'Keep Going!'}
              </h2>
              <h4 className="text-muted mb-4">{lesson.title}</h4>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <h3 className="text-primary">{progress.accuracyPercentage}%</h3>
                    <small className="text-muted">Accuracy</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <h3 className="text-success">{progress.correctAnswers}</h3>
                    <small className="text-muted">Correct Answers</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <h3 className="text-info">{progress.totalAttempts}</h3>
                    <small className="text-muted">Total Attempts</small>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/english-course/practice/${lessonId}`)}
                >
                  Practice Again
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/english-course')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {answerHistory.length > 0 && (
            <div className="card shadow">
              <div className="card-header">
                <h5 className="mb-0">Recent Answers</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Your Answer</th>
                        <th>Result</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {answerHistory.slice(0, 10).map((history, idx) => (
                        <tr key={idx}>
                          <td>{history.question?.questionText}</td>
                          <td>{history.userAnswer}</td>
                          <td>
                            {history.isCorrect ? (
                              <span className="badge bg-success">✓ Correct</span>
                            ) : (
                              <span className="badge bg-danger">✗ Wrong</span>
                            )}
                          </td>
                          <td>
                            {history.responseTimeSeconds
                              ? `${history.responseTimeSeconds}s`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card shadow mb-3">
            <div className="card-header">
              <h5 className="mb-0">Lesson Details</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Level:</strong>{' '}
                <span className="badge bg-info">
                  {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                </span>
              </p>

              {lesson.grammarFocus && (
                <p>
                  <strong>Grammar Focus:</strong>
                  <br />
                  {lesson.grammarFocus}
                </p>
              )}

              {lesson.vocabularyFocus && lesson.vocabularyFocus.length > 0 && (
                <div>
                  <strong>Vocabulary:</strong>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {lesson.vocabularyFocus.map((word, idx) => (
                      <span key={idx} className="badge bg-light text-dark">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Status</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Current Status:</strong>{' '}
                <span
                  className={`badge ${
                    progress.status === 'completed'
                      ? 'bg-success'
                      : progress.status === 'in_progress'
                      ? 'bg-primary'
                      : 'bg-secondary'
                  }`}
                >
                  {progress.status.replace('_', ' ').toUpperCase()}
                </span>
              </p>

              {progress.lastPracticedAt && (
                <p className="mb-0">
                  <strong>Last Practiced:</strong>
                  <br />
                  {new Date(progress.lastPracticedAt).toLocaleString()}
                </p>
              )}

              {progress.completedAt && (
                <p className="mb-0 mt-2">
                  <strong>Completed:</strong>
                  <br />
                  {new Date(progress.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
