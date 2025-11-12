/**
 * Admin Users Management
 * CRUD interface for user management
 */

'use client';

import { Suspense } from 'react';

interface User {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  level: number;
  totalPoints: number;
  createdAt: Date;
}

async function getUsers(): Promise<User[]> {
  // TODO: Fetch from database
  return [
    {
      id: 'user_1',
      username: 'alice',
      email: 'alice@example.com',
      displayName: 'Alice Smith',
      level: 5,
      totalPoints: 1250,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'user_2',
      username: 'bob',
      email: 'bob@example.com',
      displayName: 'Bob Johnson',
      level: 3,
      totalPoints: 780,
      createdAt: new Date('2024-02-20'),
    },
    {
      id: 'user_3',
      username: 'charlie',
      email: 'charlie@example.com',
      displayName: 'Charlie Brown',
      level: 7,
      totalPoints: 2340,
      createdAt: new Date('2023-12-10'),
    },
  ];
}

function UserRow({ user }: { user: User }) {
  return (
    <tr>
      <td>
        <div className="user-info">
          <div className="user-avatar">
            {user.displayName?.[0] || user.username[0]}
          </div>
          <div>
            <div className="user-name">{user.displayName || user.username}</div>
            <div className="user-username">@{user.username}</div>
          </div>
        </div>
      </td>
      <td>{user.email || '-'}</td>
      <td>
        <span className="badge">Level {user.level}</span>
      </td>
      <td>{user.totalPoints.toLocaleString()}</td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <div className="actions">
          <button className="btn-icon" title="Edit">✏️</button>
          <button className="btn-icon" title="Delete">🗑️</button>
        </div>
      </td>
      
      <style jsx>{`
        tr {
          border-bottom: 1px solid #E5E5E5;
        }
        
        tr:hover {
          background-color: #F9F9F9;
        }
        
        td {
          padding: 16px;
          font-size: 14px;
          color: #666666;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #5E6AD2;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }
        
        .user-name {
          font-weight: 500;
          color: #1A1A1A;
          margin-bottom: 2px;
        }
        
        .user-username {
          font-size: 12px;
          color: #999999;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 8px;
          background-color: #F0F0F0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #666666;
        }
        
        .actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.15s ease;
        }
        
        .btn-icon:hover {
          opacity: 1;
        }
      `}</style>
    </tr>
  );
}

async function UsersTable() {
  const users = await getUsers();
  
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Level</th>
            <th>Points</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
      
      <style jsx>{`
        .table-container {
          background-color: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table thead {
          background-color: #F9F9F9;
          border-bottom: 1px solid #E5E5E5;
        }
        
        .data-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="users-page">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <div className="header-actions">
          <input
            type="search"
            placeholder="Search users..."
            className="search-input"
          />
          <button className="btn btn-primary">Add User</button>
        </div>
      </header>
      
      <div className="filters">
        <select className="filter-select">
          <option>All Users</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select className="filter-select">
          <option>All Levels</option>
          <option>Level 1-3</option>
          <option>Level 4-6</option>
          <option>Level 7+</option>
        </select>
      </div>
      
      <Suspense fallback={<div>Loading users...</div>}>
        <UsersTable />
      </Suspense>
      
      <style jsx>{`
        .users-page {
          max-width: 1400px;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        .page-header h1 {
          font-size: 32px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }
        
        .page-header p {
          font-size: 16px;
          color: #666666;
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .search-input {
          padding: 8px 16px;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          font-size: 14px;
          width: 240px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #5E6AD2;
          box-shadow: 0 0 0 3px rgba(94, 106, 210, 0.1);
        }
        
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .btn-primary {
          background-color: #5E6AD2;
          color: #FFFFFF;
        }
        
        .btn-primary:hover {
          background-color: #4E5BBE;
        }
        
        .btn-primary:active {
          background-color: #3E4AAE;
          transform: scale(0.98);
        }
        
        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          font-size: 14px;
          background-color: #FFFFFF;
          cursor: pointer;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #5E6AD2;
        }
      `}</style>
    </div>
  );
}
