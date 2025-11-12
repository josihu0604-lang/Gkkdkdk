/**
 * Admin Reviews Moderation Page
 * Approve, reject, hide, or unhide reviews
 */

'use client';

import { useState, useEffect } from 'react';
import { useReviews, useZZIKClient } from '@/lib/sdk/hooks';

export default function AdminReviewsPage() {
  const client = useZZIKClient();
  const { data, loading, error, refetch } = useReviews({ limit: 50 });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleModerate = async (
    reviewId: string,
    action: 'approve' | 'reject' | 'hide' | 'unhide',
    reason?: string
  ) => {
    try {
      setActionLoading(reviewId);
      
      await client.reviews.moderate(reviewId, action, 'admin-id', reason);
      
      // Refresh list
      await refetch();
      
      alert(`Review ${action}d successfully`);
    } catch (err) {
      alert(`Failed to ${action} review`);
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const reviews = data?.data || [];
  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !review.isApproved;
    if (filter === 'approved') return review.isApproved;
    if (filter === 'hidden') return !review.isApproved;
    return true;
  });

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading reviews...</div></div>;
  }

  if (error) {
    return <div className="admin-page"><div className="error">Error: {error.message}</div></div>;
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Review Moderation</h1>
        <p>Approve, reject, hide, or unhide user reviews</p>
      </header>

      <div className="filters">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({reviews.filter((r) => !r.isApproved).length})
        </button>
        <button
          className={`filter-button ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({reviews.filter((r) => r.isApproved).length})
        </button>
      </div>

      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <div className="empty-text">No reviews found</div>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className={`review-card ${!review.isApproved ? 'pending' : ''}`}>
              <div className="review-header">
                <div className="review-user">
                  <img
                    src={review.user.avatarUrl || '/default-avatar.png'}
                    alt={review.user.displayName}
                    className="user-avatar"
                  />
                  <div>
                    <div className="user-name">{review.user.displayName}</div>
                    <div className="user-username">@{review.user.username}</div>
                  </div>
                </div>
                <div className="review-status">
                  {review.isApproved ? (
                    <span className="badge approved">Approved</span>
                  ) : (
                    <span className="badge pending">Pending</span>
                  )}
                </div>
              </div>

              <div className="review-place">
                <span className="place-icon">📍</span>
                <span>{review.place?.name}</span>
              </div>

              <div className="review-rating">
                {'⭐'.repeat(review.rating)}
                <span className="rating-number">({review.rating}/5)</span>
              </div>

              <div className="review-content">
                <h3>{review.title}</h3>
                <p>{review.content}</p>
              </div>

              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="review-images">
                  {review.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Review image ${idx + 1}`} />
                  ))}
                </div>
              )}

              <div className="review-meta">
                <span>👍 {review.helpfulCount} helpful</span>
                <span>📅 {new Date(review.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="review-actions">
                {!review.isApproved && (
                  <button
                    className="action-btn approve"
                    onClick={() => handleModerate(review.id, 'approve')}
                    disabled={actionLoading === review.id}
                  >
                    ✅ Approve
                  </button>
                )}
                {review.isApproved && (
                  <button
                    className="action-btn hide"
                    onClick={() => {
                      const reason = prompt('Reason for hiding:');
                      if (reason) {
                        handleModerate(review.id, 'hide', reason);
                      }
                    }}
                    disabled={actionLoading === review.id}
                  >
                    🚫 Hide
                  </button>
                )}
                {!review.isApproved && (
                  <button
                    className="action-btn reject"
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) {
                        handleModerate(review.id, 'reject', reason);
                      }
                    }}
                    disabled={actionLoading === review.id}
                  >
                    ❌ Reject
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .admin-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #666;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-button:hover {
          background: #f3f4f6;
        }

        .filter-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .review-card.pending {
          border-color: #fbbf24;
          background: #fffbeb;
        }

        .review-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .review-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 600;
        }

        .user-username {
          font-size: 0.875rem;
          color: #666;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge.approved {
          background: #d1fae5;
          color: #065f46;
        }

        .badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .review-place {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: #666;
        }

        .place-icon {
          font-size: 1.25rem;
        }

        .review-rating {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .rating-number {
          margin-left: 0.5rem;
          font-size: 0.875rem;
          color: #666;
        }

        .review-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .review-content p {
          color: #374151;
          line-height: 1.6;
        }

        .review-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .review-images img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
        }

        .review-meta {
          display: flex;
          gap: 1.5rem;
          margin: 1rem 0;
          font-size: 0.875rem;
          color: #666;
        }

        .review-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.approve {
          background: #10b981;
          color: white;
        }

        .action-btn.approve:hover:not(:disabled) {
          background: #059669;
        }

        .action-btn.hide {
          background: #f59e0b;
          color: white;
        }

        .action-btn.hide:hover:not(:disabled) {
          background: #d97706;
        }

        .action-btn.reject {
          background: #ef4444;
          color: white;
        }

        .action-btn.reject:hover:not(:disabled) {
          background: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-text {
          color: #666;
          font-size: 1.125rem;
        }

        .loading,
        .error {
          text-align: center;
          padding: 4rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}
