import { Route, Routes } from 'react-router-dom';
import { MobileLayout } from './components/layouts/MobileLayout';
import './index.css';
import { Home } from './routes/home';
import { Login } from './routes/login';

function App() {
  return (
      <MobileLayout>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/login' element={<Login/>} />
        </Routes>
      </MobileLayout>
  );
}

export default App;
