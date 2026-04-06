import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import AboutClepsydra from './pages/AboutClepsydra';
import Partners from './pages/Partners';
import Visual from './pages/Visual';
import RealConditions from './pages/RealConditions';
import DataBibliography from './pages/DataBibliography';
import Layout from './components/Layout';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about-c" element={<AboutClepsydra />} />
            <Route path="/parceiros" element={<Partners />} />
            <Route path="/biblio-dados" element={<DataBibliography />} />
            <Route path="/visual" element={<Visual />} />
            <Route path="/condicoes-reais" element={<RealConditions />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
