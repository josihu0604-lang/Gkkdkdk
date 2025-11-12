/**
 * Admin Dashboard Overview
 * Shows key metrics and recent activity
 */

'use client';

import { Suspense } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
}

function StatsCard({ title, value, change, trend }: StatsCardProps) {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <div className="stats-value">{value}</div>
      {change && (
        <div className={`stats-change ${trend}`}>
          <span className="icon">{trend === 'up' ? '↑' : '↓'}</span>
          {change}
        </div>
      )}
      
      <style jsx>{`
        .stats-card {
          background-color: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          padding: 24px;
        }
        
        .stats-card h3 {
          font-size: 14px;
          font-weight: 500;
          color: #666666;
          margin: 0 0 12px 0;
        }
        
        .stats-value {
          font-size: 32px;
          font-weight: 600;
          color: #1A1A1A;
          letter-spacing: -1px;
          margin-bottom: 8px;
        }
        
        .stats-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .stats-change.up {
          color: #10B981;
        }
        
        .stats-change.down {
          color: #EF4444;
        }
        
        .stats-change .icon {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}

async function getAdminStats() {
  // TODO: Fetch real stats from database
  return {
    totalUsers: 1247,
    totalPlaces: 523,
    totalCheckIns: 8934,
    totalVouchers: 2156,
    activeUsers: 342,
    userGrowth: '+12.5%',
    checkInGrowth: '+8.3%',
    voucherGrowth: '+15.7%',
  };
}

async function AdminStats() {
  const stats = await getAdminStats();
  
  return (
    <div className="stats-grid">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        change={stats.userGrowth}
        trend="up"
      />
      <StatsCard
        title="Total Places"
        value={stats.totalPlaces.toLocaleString()}
      />
      <StatsCard
        title="Total Check-ins"
        value={stats.totalCheckIns.toLocaleString()}
        change={stats.checkInGrowth}
        trend="up"
      />
      <StatsCard
        title="Total Vouchers"
        value={stats.totalVouchers.toLocaleString()}
        change={stats.voucherGrowth}
        trend="up"
      />
      <StatsCard
        title="Active Users (24h)"
        value={stats.activeUsers.toLocaleString()}
      />
      
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
      `}</style>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    { id: 1, user: 'user_123', action: 'Check-in approved', place: 'Cafe Mono', time: '2 min ago' },
    { id: 2, user: 'user_456', action: 'Voucher issued', place: 'Restaurant ABC', time: '5 min ago' },
    { id: 3, user: 'user_789', action: 'Level up', place: 'Level 5', time: '12 min ago' },
    { id: 4, user: 'user_234', action: 'Check-in approved', place: 'Shop XYZ', time: '18 min ago' },
    { id: 5, user: 'user_567', action: 'Review posted', place: 'Cafe Mono', time: '25 min ago' },
  ];
  
  return (
    <div className="activity-section">
      <h2>Recent Activity</h2>
      
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-info">
              <div className="activity-user">{activity.user}</div>
              <div className="activity-action">
                {activity.action} at <strong>{activity.place}</strong>
              </div>
            </div>
            <div className="activity-time">{activity.time}</div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .activity-section {
          background-color: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          padding: 24px;
        }
        
        .activity-section h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0 0 24px 0;
          letter-spacing: -0.5px;
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 1px solid #F5F5F5;
        }
        
        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        
        .activity-info {
          flex: 1;
        }
        
        .activity-user {
          font-size: 12px;
          font-weight: 500;
          color: #5E6AD2;
          margin-bottom: 4px;
        }
        
        .activity-action {
          font-size: 14px;
          color: #666666;
        }
        
        .activity-action strong {
          color: #1A1A1A;
          font-weight: 500;
        }
        
        .activity-time {
          font-size: 12px;
          color: #999999;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </header>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <AdminStats />
      </Suspense>
      
      <RecentActivity />
      
      <style jsx>{`
        .admin-dashboard {
          max-width: 1400px;
        }
        
        .dashboard-header {
          margin-bottom: 32px;
        }
        
        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }
        
        .dashboard-header p {
          font-size: 16px;
          color: #666666;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
