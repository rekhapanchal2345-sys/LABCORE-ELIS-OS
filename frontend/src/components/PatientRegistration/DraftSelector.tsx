import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DraftSelector.css';

interface Draft {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  formProgress: number;
  formStep: number;
  updatedAt: string;
}

interface DraftSelectorProps {
  onSelectDraft: (draftId: string) => void;
  onNewRegistration: () => void;
}

const DraftSelector: React.FC<DraftSelectorProps> = ({ onSelectDraft, onNewRegistration }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/patients/drafts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDrafts(response.data.data.drafts || []);
    } catch (err) {
      setError('Failed to fetch drafts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    try {
      await axios.delete(`/api/patients/drafts/${draftId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDrafts(drafts.filter(d => d.id !== draftId));
    } catch (err) {
      setError('Failed to delete draft');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="draft-selector loading">
        <div className="spinner"></div>
        <p>Loading drafts...</p>
      </div>
    );
  }

  return (
    <div className="draft-selector">
      <div className="draft-header">
        <h2>📝 Saved Drafts</h2>
        <button className="btn-new" onClick={onNewRegistration}>
          + New Registration
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {drafts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Drafts Found</h3>
          <p>Start a new patient registration or your previous drafts have been cleaned up</p>
          <button className="btn-primary" onClick={onNewRegistration}>
            Create New Registration
          </button>
        </div>
      ) : (
        <div className="drafts-grid">
          {drafts.map(draft => (
            <div key={draft.id} className="draft-card">
              <div className="draft-card-header">
                <h3>{draft.firstName} {draft.lastName}</h3>
                <span className="progress-badge">{draft.formProgress}%</span>
              </div>

              <div className="draft-card-body">
                <p className="draft-phone">📱 {draft.phone}</p>
                {draft.email && <p className="draft-email">✉️ {draft.email}</p>}
                <p className="draft-step">Step {draft.formStep} / 4</p>
                <p className="draft-date">Last updated: {formatDate(draft.updatedAt)}</p>
              </div>

              <div className="draft-progress-bar">
                <div className="progress-fill" style={{ width: `${draft.formProgress}%` }}></div>
              </div>

              <div className="draft-card-footer">
                <button
                  className="btn-resume"
                  onClick={() => onSelectDraft(draft.id)}
                >
                  ▶ Resume
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteDraft(draft.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftSelector;
