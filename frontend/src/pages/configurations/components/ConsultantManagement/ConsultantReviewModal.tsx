import React, { useState } from 'react';
import { Consultant } from '../../../../types/consultant';

interface ConsultantReviewModalProps {
  consultant: Consultant;
  onClose: () => void;
  onSubmit: (score: number, notes: string) => void;
}

const ConsultantReviewModal: React.FC<ConsultantReviewModalProps> = ({
  consultant,
  onClose,
  onSubmit
}) => {
  const [score, setScore] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{
    score?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { score?: string } = {};
    
    if (score < 0 || score > 5) {
      newErrors.score = 'Score must be between 0 and 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(score, notes);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setScore(value)}
            className="focus:outline-none"
          >
            <span className={`text-2xl ${value <= score ? 'text-yellow-500' : 'text-gray-600'}`}>
              ★
            </span>
          </button>
        ))}
        <span className="ml-2 text-gray-300">{score.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1f2b] rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Review {consultant.contactFirstName} {consultant.contactLastName}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Interview Score (0-5)
            </label>
            {renderStars()}
            {errors.score && (
              <p className="mt-1 text-sm text-red-500">{errors.score}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Note: Score ≥ 3 will approve the consultant. Score less 3 will reject.
            </p>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-1">
              Review Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide feedback about the interview..."
              className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultantReviewModal;