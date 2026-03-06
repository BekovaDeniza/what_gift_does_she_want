import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateLink from './pages/CreateLink';
import Survey from './pages/Survey';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/link" element={<CreateLink />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/s/:code" element={<Survey />} />
    </Routes>
  );
}

export default App;
