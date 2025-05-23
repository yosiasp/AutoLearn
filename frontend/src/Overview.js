import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Overview.css';

const Overview = () => {
  const navigate = useNavigate();

  return (
    <div className="overview-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="logo-container">
          <img src="/logo.png" alt="Logo"/>
        </div>
        <p className="hero-subtitle">Platform Pembelajaran AI yang Mengubah Cara Anda Belajar</p>
        <div className="cta-buttons">
          <button className="primary-btn" onClick={() => navigate('/register')}>
            Mulai Belajar
          </button>
          <button className="secondary-btn" onClick={() => navigate('/login')}>
            Masuk
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Fitur Unggulan</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Pembelajaran Adaptif</h3>
            <p>Sistem pembelajaran yang menyesuaikan dengan kemampuan dan gaya belajar Anda secara real-time</p>
          </div>
          <div className="feature-card">
            <h3>AI Powered</h3>
            <p>Didukung oleh teknologi AI canggih untuk pengalaman belajar yang lebih personal dan efektif</p>
          </div>
          <div className="feature-card">
            <h3>Progress Tracking</h3>
            <p>Pantau perkembangan belajar Anda dengan analisis detail dan rekomendasi yang tepat</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <h2>Bagaimana AutoLearn Bekerja</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Buat Akun</h3>
            <p>Daftar dan buat profil pembelajaran Anda</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Pilih Materi</h3>
            <p>Pilih topik yang ingin Anda pelajari</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Mulai Belajar</h3>
            <p>Mulai perjalanan pembelajaran Anda dengan AI</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="overview-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>AutoLearn</h4>
            <p>Platform pembelajaran masa depan</p>
          </div>
          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li><a href="#" onClick={() => navigate('/about')}>Tentang Kami</a></li>
              <li><a href="#" onClick={() => navigate('/contact')}>Kontak</a></li>
              <li><a href="#" onClick={() => navigate('/privacy')}>Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AutoLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Overview; 