import React, { useState, useEffect } from 'react';
import api from '../../../service/apiService';
import { toast } from 'react-hot-toast';
import { Consultant } from '../../../types/consultant';

// Feedback categories
const FEEDBACK_CATEGORIES = [
  'Job Fit / Technical Competence',
  'Behavioral & Soft Skills',
  'Cultural Fit',
  'Problem Solving & Critical Thinking',
  'Motivation & Career Goals',
  'Past Performance',
  'Leadership & Initiative',
  'Adaptability',
  'Domain Knowledge',
  'Red Flags'
];

// Criteria grouped by category
const CRITERIA_BY_CATEGORY: Record<string, string[]> = {
  'Job Fit / Technical Competence': [
    'Relevant experience',
    'Technical skills or certifications',
    'Problem-solving ability',
    'Knowledge of tools/technologies',
    'Ability to learn quickly'
  ],
  'Behavioral & Soft Skills': [
    'Communication skills',
    'Teamwork and collaboration',
    'Conflict resolution',
    'Work ethic and integrity',
    'Time management and organization',
    'Emotional intelligence (EQ)'
  ],
  'Cultural Fit': [
    'Alignment with company values',
    'Attitude and mindset',
    'Professionalism and demeanor',
    'Work style compatibility'
  ],
  'Problem Solving & Critical Thinking': [
    'Analytical thinking',
    'Decision-making under pressure',
    'Creative approaches to challenges'
  ],
  'Motivation & Career Goals': [
    'Why they want the job',
    'Career aspiration alignment',
    'Long-term potential'
  ],
  'Past Performance': [
    'Achievements in past roles',
    'Promotion or growth history',
    'References and endorsements',
    'Employment gap analysis'
  ],
  'Leadership & Initiative': [
    'Leadership style',
    'Examples of initiative',
    'Project/people management experience',
    'Stakeholder management'
  ],
  'Adaptability': [
    'Experience in dynamic environments',
    'Handling change/uncertainty',
    'Response to changing scenarios'
  ],
  'Domain Knowledge': [
    'Industry-specific knowledge',
    'Regulatory awareness'
  ],
  'Red Flags': [
    'Evasive or vague answers',
    'Blaming others for failures',
    'Overstated achievements',
    'Poor listening or attitude'
  ]
};

interface ConsultantInfo {
  id: string;
  name: string;
  email: string;
  status: string;
  isAllowedToLogin: boolean;
}

interface FeedbackItem {
  score: number;
  comment: string;
}

type FeedbackDataByCategory = Record<string, Record<string, FeedbackItem>>;

const ConsultantFeedback: React.FC = () => {
  const [consultants, setConsultants] = useState<ConsultantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(FEEDBACK_CATEGORIES[0]);
  
  // Feedback data structured by category
  const [feedbackDataByCategory, setFeedbackDataByCategory] = useState<FeedbackDataByCategory>({});
  
  const [finalNotes, setFinalNotes] = useState<string>('');
  const [consultantDetails, setConsultantDetails] = useState<ConsultantInfo | null>(null);
  const [completedCategories, setCompletedCategories] = useState<Set<string>>(new Set());

  // Get current category feedback data
  const getCurrentCategoryFeedback = () => {
    return feedbackDataByCategory[selectedCategory] || {};
  };

  // Calculate final score based on all scored criteria across all categories
  const calculateFinalScore = (): number => {
    // Collect all scores from all categories
    const allScores: number[] = [];
    
    Object.values(feedbackDataByCategory).forEach(categoryData => {
      Object.values(categoryData).forEach(item => {
        if (item.score > 0) {
          allScores.push(item.score);
        }
      });
    });
    
    if (allScores.length === 0) return 0;
    
    // Count scores that are 3 or higher
    const goodScoresCount = allScores.filter(score => score >= 3).length;
    
    // If all scores are less than 3, then return a rejection score (1 or 2)
    if (goodScoresCount === 0) {
      return 2;
    }
    
    // If at least 3 scores or more than half of all scores are 3+, then return an approval score (3+)
    if (goodScoresCount >= 3 || goodScoresCount >= allScores.length / 2) {
      return 4;
    }
    
    // Otherwise return a borderline score
    return 3;
  };

  // Determine approval status based on final score
  const determineFinalStatus = (score: number): 'APPROVED' | 'REJECTED' => {
    return score >= 3 ? 'APPROVED' : 'REJECTED';
  };

  // Fetch consultants from API - only those with pending status and interview scheduled
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        // Get all consultants
        const response = await api.get('/api/consultants');
        
        if (response?.data?.data) {
          // First map all consultants to the desired format
          const formattedConsultants = response.data.data.map((consultant: any) => ({
            id: consultant.id,
            name: `${consultant.contactFirstName || ''} ${consultant.contactLastName || ''}`.trim() || consultant.email,
            email: consultant.email,
            status: consultant.status,
            isAllowedToLogin: consultant.isAllowedToLogin
          }))            .filter((consultant:any) => consultant.status === 'INTERVIEW_SCHEDULED');

          // Then filter the mapped consultants who need review
          // .filter(consultant => 
          //   consultant.status === 'INTERVIEW_SCHEDULED' && consultant.isAllowedToLogin === false
          // );
          
          setConsultants(formattedConsultants);
        } else {
          throw new Error('Failed to fetch consultants');
        }
      } catch (error) {
        console.error('Error fetching consultants:', error);
        toast.error('Failed to load consultants');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  // Load consultant details when selected
  useEffect(() => {
    if (selectedConsultant) {
      const selected = consultants.find(c => c.id === selectedConsultant) || null;
      setConsultantDetails(selected);
    } else {
      setConsultantDetails(null);
    }
  }, [selectedConsultant, consultants]);

  // Check if current category has been completed when feedback changes
  useEffect(() => {
    // Check if current category has any scores
    const currentCategoryData = feedbackDataByCategory[selectedCategory] || {};
    const hasScores = Object.values(currentCategoryData).some(item => item.score > 0);
    
    // Update completed categories
    setCompletedCategories(prev => {
      const updated = new Set(prev);
      if (hasScores) {
        updated.add(selectedCategory);
      } else {
        updated.delete(selectedCategory);
      }
      return updated;
    });
  }, [feedbackDataByCategory, selectedCategory]);

  // Handle feedback data changes
  const handleFeedbackChange = (criteria: string, field: 'score' | 'comment', value: string | number) => {
    const currentCategoryData = feedbackDataByCategory[selectedCategory] || {};
    const updatedCategoryData = {
      ...currentCategoryData,
      [criteria]: {
        ...currentCategoryData[criteria],
        [field]: value
      }
    };
    
    setFeedbackDataByCategory({
      ...feedbackDataByCategory,
      [selectedCategory]: updatedCategoryData
    });
  };

  // Submit final review with score and update consultant status
  const handleSubmitReview = async () => {
    if (!selectedConsultant) {
      toast.error('Please select a consultant');
      return;
    }

    // Calculate final score based on all criteria scores across all categories
    const finalScore = calculateFinalScore();
    
    if (finalScore === 0) {
      toast.error('Please provide at least one score');
      return;
    }

    // Determine final status based on score
    const finalStatus = determineFinalStatus(finalScore);
    
    try {
      setSubmitting(true);
      
      // Prepare all feedback data for submission
      const allCriteria: { name: string; score: number; comment: string; category: string }[] = [];
      
      Object.entries(feedbackDataByCategory).forEach(([category, categoryData]) => {
        Object.entries(categoryData).forEach(([criteriaName, data]) => {
          if (data.score > 0) {
            allCriteria.push({
              name: criteriaName,
              score: data.score,
              comment: data.comment || '',
              category
            });
          }
        });
      });
      
      // Group criteria by category for the API
      const groupedFeedback = FEEDBACK_CATEGORIES.map(category => ({
        consultantId: selectedConsultant,
        category,
        criteria: allCriteria
          .filter(item => item.category === category)
          .map(({ name, score, comment }) => ({ name, score, comment }))
      })).filter(group => group.criteria.length > 0);
      
      // Save detailed feedback for each category
      // for (const feedback of groupedFeedback) {
      //   await api.post('/api/feedback', feedback);
      // }
      
      // Now submit the review and update consultant status
      const response = await api.post(`/api/consultants/${selectedConsultant}/review`, {
        score: finalScore,
        notes: finalNotes || `Overall assessment across ${completedCategories.size} categories`,
      });
      
      if (response.data?.success) {
        toast.success(`Consultant ${finalStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
        
        // Update local consultants list by removing the reviewed consultant
        setConsultants(prev => prev.filter(c => c.id !== selectedConsultant));
        
        // Reset form
        setSelectedConsultant('');
        setFeedbackDataByCategory({});
        setCompletedCategories(new Set());
        setFinalNotes('');
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total criteria scored across all categories
  const getTotalScoredCriteriaCount = () => {
    let count = 0;
    Object.values(feedbackDataByCategory).forEach(categoryData => {
      count += Object.values(categoryData).filter(item => item.score > 0).length;
    });
    return count;
  };

  // Get the count of scores above/below threshold across all categories
  const getAllScoreDistribution = () => {
    const allScores: number[] = [];
    Object.values(feedbackDataByCategory).forEach(categoryData => {
      Object.values(categoryData).forEach(item => {
        if (item.score > 0) {
          allScores.push(item.score);
        }
      });
    });
    
    const highScores = allScores.filter(score => score >= 3).length;
    const lowScores = allScores.filter(score => score < 3).length;
    return { highScores, lowScores, total: allScores.length };
  };

  // Get the current category's scored criteria count
  const getCurrentCategoryScoredCount = () => {
    const currentCategoryData = feedbackDataByCategory[selectedCategory] || {};
    return Object.values(currentCategoryData).filter(item => item.score > 0).length;
  };

  

  return (
    <div className="space-y-6">
      {/* Consultant Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-200">Consultant Interview Review</h2>
          <p className="text-sm text-gray-400 mt-1">
            Evaluate consultants who have completed their interviews
          </p>
        </div>
        <select
          value={selectedConsultant}
          onChange={(e) => {
            setSelectedConsultant(e.target.value);
            setFeedbackDataByCategory({});
            setCompletedCategories(new Set());
          }}
          className="bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Consultant</option>
          {consultants.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
          ))}
        </select>
      </div>

      {consultants.length === 0 && !loading && (
        <div className="bg-[#242935] rounded-xl p-6 shadow-lg text-center text-gray-400">
          No consultants pending review at this time.
        </div>
      )}

      {loading && (
        <div className="bg-[#242935] rounded-xl p-6 shadow-lg text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading consultants...</p>
        </div>
      )}

      {selectedConsultant && consultantDetails && (
        <>
          {/* Category Progress Indicator */}
          <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">Assessment Categories</h3>
              <span className="text-sm text-gray-400">
                {completedCategories.size} of {FEEDBACK_CATEGORIES.length} categories assessed
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : completedCategories.has(cat)
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        : 'bg-[#1a1f2b] text-gray-400 hover:bg-[#2e3446]'
                  }`}
                >
                  {cat}
                  {completedCategories.has(cat) && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scoring Information */}
          <div className="bg-[#1a1f2b] rounded-xl p-4 text-sm text-gray-300">
            <p className="mb-2">
              <span className="font-medium">Scoring Guide:</span> Rate each criteria from 1-5
            </p>
            <ul className="list-disc list-inside">
              <li>Scores less than 3 indicate poor performance</li>
              <li>Scores of 3 or higher indicate satisfactory or good performance</li>
              <li>An overall score below 3 will result in rejection</li>
              <li>An overall score of 3 or higher will result in approval</li>
            </ul>
          </div>

          {/* Current Category Name */}
          <div className="bg-[#242935] rounded-xl p-4">
            <h3 className="text-lg font-medium text-gray-200">
              Category: {selectedCategory}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {getCurrentCategoryScoredCount()} of {CRITERIA_BY_CATEGORY[selectedCategory]?.length || 0} criteria scored in this category
            </p>
          </div>

          {/* Criteria Table */}
          <div className="bg-[#242935] rounded-xl p-6 shadow-lg overflow-x-auto">
            <table className="min-w-full text-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Evaluation Criteria</th>
                  <th className="px-4 py-2 text-left">Score (1-5)</th>
                  <th className="px-4 py-2 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {(CRITERIA_BY_CATEGORY[selectedCategory] || []).map(criteria => (
                  <tr key={criteria} className="border-t border-gray-600">
                    <td className="px-4 py-2">{criteria}</td>
                    <td className="px-4 py-2">
                      <select
                        value={getCurrentCategoryFeedback()[criteria]?.score || ''}
                        onChange={(e) => 
                          handleFeedbackChange(criteria, 'score', Number(e.target.value))
                        }
                        className="bg-[#1a1f2b] text-gray-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-</option>
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <textarea
                        value={getCurrentCategoryFeedback()[criteria]?.comment || ''}
                        onChange={(e) => 
                          handleFeedbackChange(criteria, 'comment', e.target.value)
                        }
                        className="w-full bg-[#1a1f2b] text-gray-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final Notes */}
          <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Final Review Notes
            </label>
            <textarea
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              rows={4}
              className="w-full bg-[#1a1f2b] text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add overall assessment and recommendations..."
            />
          </div>

          {/* Overall Review Summary */}
          {getTotalScoredCriteriaCount() > 0 && (
            <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-200 mb-3">Overall Review Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Categories assessed:</span>
                  <span className="text-gray-200">{completedCategories.size} of {FEEDBACK_CATEGORIES.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total criteria scored:</span>
                  <span className="text-gray-200">{getTotalScoredCriteriaCount()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Passing scores (≥3):</span>
                  <span className="text-green-500">{getAllScoreDistribution().highScores}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Low scores (&lt;3):</span>
                  <span className="text-red-500">{getAllScoreDistribution().lowScores}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-gray-200 font-medium">Calculated final score:</span>
                  <span className={`font-medium ${calculateFinalScore() >= 3 ? 'text-green-500' : 'text-red-500'}`}>
                    {calculateFinalScore() > 0 ? calculateFinalScore() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-200 font-medium">Recommendation:</span>
                  <span className={`font-medium ${calculateFinalScore() >= 3 ? 'text-green-500' : 'text-red-500'}`}>
                    {calculateFinalScore() > 0 ? (calculateFinalScore() >= 3 ? 'Approve' : 'Reject') : 'No recommendation yet'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmitReview}
              disabled={submitting || getTotalScoredCriteriaCount() === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Final Review'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConsultantFeedback;