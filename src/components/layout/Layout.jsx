import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout-wrapper">
      <Header />
      <main className="layout-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}