/**
 * Admin Dashboard Main Page
 * Overview of platform statistics and recent activity
 */

'use client';

import { useEffect, useState } from 'react';
import { useZZIKClient } from '@/lib/sdk/hooks';

interface DashboardStats {
  totalUsers: number;
  totalPlaces: number;
  totalCheckIns: number;
  totalReviews: number;
  pendingCheckIns: number;
  pendingReviews: number;
}

export default function AdminDashboardPage() {
  const client = useZZIKClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPlaces: 0,
    totalCheckIns: 0,
    totalReviews: 0,
    pendingCheckIns: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Fetch stats from API
      // For now, using placeholder data
      setStats({
        totalUsers: 1250,
        totalPlaces: 340,
        totalCheckIns: 8920,
        totalReviews: 3420,
        pendingCheckIns: 45,
        pendingReviews: 12,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and statistics</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <div className="stat-label">Total Places</div>
            <div className="stat-value">{stats.totalPlaces.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Total Check-ins</div>
            <div className="stat-value">{stats.totalCheckIns.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-label">Total Reviews</div>
            <div className="stat-value">{stats.totalReviews.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending Check-ins</div>
            <div className="stat-value">{stats.pendingCheckIns}</div>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <div className="stat-label">Pending Reviews</div>
            <div className="stat-value">{stats.pendingReviews}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/admin/check-ins" className="action-button">
              <span className="icon">✅</span>
              <span>Review Check-ins</span>
            </a>
            <a href="/admin/reviews" className="action-button">
              <span className="icon">⭐</span>
              <span>Moderate Reviews</span>
            </a>
            <a href="/admin/users" className="action-button">
              <span className="icon">👥</span>
              <span>Manage Users</span>
            </a>
            <a href="/admin/places" className="action-button">
              <span className="icon">📍</span>
              <span>Manage Places</span>
            </a>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <span className="activity-text">45 check-ins pending review</span>
              <span className="activity-time">Just now</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">⭐</span>
              <span className="activity-text">12 reviews awaiting moderation</span>
              <span className="activity-time">5 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">👥</span>
              <span className="activity-text">8 new users registered</span>
              <span className="activity-time">1 hour ago</span>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: #666;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          transition: all 0.2s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card.alert {
          border-color: #fbbf24;
          background: #fffbeb;
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111;
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .dashboard-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .dashboard-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          text-decoration: none;
          color: #111;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .action-button .icon {
          font-size: 2rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .activity-icon {
          font-size: 1.5rem;
        }

        .activity-text {
          flex: 1;
          color: #333;
        }

        .activity-time {
          color: #666;
          font-size: 0.875rem;
        }

        .loading {
          text-align: center;
          padding: 4rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-sections {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
