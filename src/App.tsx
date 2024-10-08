import './App.css';
import { Route, Routes, HashRouter } from 'react-router-dom';
import BetPage from './pages/BetPage';
import ListPage from './pages/ListPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div className='app'>
      <Routes>
        < Route path="" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/bet/:address" element={<BetPage />} />
      </Routes>
    </div>

  );
}

export default App