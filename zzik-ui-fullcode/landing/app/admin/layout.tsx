/**
 * Admin Dashboard Layout
 * Protected layout with sidebar navigation
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Link href="/admin">ZZIK Admin</Link>
        </div>
        
        <nav className="admin-nav">
          <div className="nav-section">
            <h3>Content</h3>
            <Link href="/admin/users" className="nav-item">
              <span className="icon">👥</span>
              Users
            </Link>
            <Link href="/admin/places" className="nav-item">
              <span className="icon">📍</span>
              Places
            </Link>
            <Link href="/admin/check-ins" className="nav-item">
              <span className="icon">✓</span>
              Check-ins
            </Link>
            <Link href="/admin/vouchers" className="nav-item">
              <span className="icon">🎁</span>
              Vouchers
            </Link>
            <Link href="/admin/reviews" className="nav-item">
              <span className="icon">⭐</span>
              Reviews
            </Link>
          </div>
          
          <div className="nav-section">
            <h3>Analytics</h3>
            <Link href="/admin/analytics" className="nav-item">
              <span className="icon">📊</span>
              Overview
            </Link>
            <Link href="/admin/performance" className="nav-item">
              <span className="icon">⚡</span>
              Performance
            </Link>
            <Link href="/admin/errors" className="nav-item">
              <span className="icon">🐛</span>
              Error Logs
            </Link>
          </div>
          
          <div className="nav-section">
            <h3>Settings</h3>
            <Link href="/admin/settings" className="nav-item">
              <span className="icon">⚙️</span>
              Configuration
            </Link>
            <Link href="/admin/api-keys" className="nav-item">
              <span className="icon">🔑</span>
              API Keys
            </Link>
          </div>
        </nav>
      </aside>
      
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-actions">
            <Link href="/" className="btn btn-secondary">
              Back to Site
            </Link>
          </div>
        </header>
        
        <div className="admin-content">
          {children}
        </div>
      </main>
      
      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #F5F5F5;
        }
        
        .admin-sidebar {
          width: 240px;
          background-color: #FFFFFF;
          border-right: 1px solid #E5E5E5;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }
        
        .admin-logo {
          padding: 24px;
          border-bottom: 1px solid #E5E5E5;
        }
        
        .admin-logo a {
          font-size: 20px;
          font-weight: 600;
          color: #1A1A1A;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        
        .admin-nav {
          padding: 16px;
        }
        
        .nav-section {
          margin-bottom: 24px;
        }
        
        .nav-section h3 {
          font-size: 12px;
          font-weight: 600;
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px 0;
          padding: 0 8px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          color: #666666;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          transition: all 0.15s ease;
        }
        
        .nav-item:hover {
          background-color: #F5F5F5;
          color: #1A1A1A;
        }
        
        .nav-item .icon {
          font-size: 16px;
        }
        
        .admin-main {
          margin-left: 240px;
          flex: 1;
        }
        
        .admin-header {
          background-color: #FFFFFF;
          border-bottom: 1px solid #E5E5E5;
          padding: 16px 32px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .admin-content {
          padding: 32px;
        }
        
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .btn-secondary {
          background-color: #FFFFFF;
          color: #666666;
          border: 1px solid #E5E5E5;
        }
        
        .btn-secondary:hover {
          background-color: #F5F5F5;
          border-color: #D4D4D4;
        }
      `}</style>
    </div>
  );
}
