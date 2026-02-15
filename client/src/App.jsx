import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import PollRoom from './components/PollRoom';
import LandingPage from './components/LandingPage';
import MyPolls from './components/MyPolls';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<div className="container center-all"><CreatePoll /></div>} />
        <Route path="/poll/:id" element={<div className="container center-all"><PollRoom /></div>} />
        <Route path="/my-polls" element={<div className="container center-all"><MyPolls /></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;