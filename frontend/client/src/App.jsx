// src/App.jsx
import React from 'react';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <div>
      <Navbar />
      {/* You can add your main content here */}
      <main>
        {/* Example placeholder content */}
        <section style={{ minHeight: '80vh', background: '#0a2647' }}>
          {/* Your page content goes here */}
        </section>
      </main>
    </div>
  );
}

export default App;
