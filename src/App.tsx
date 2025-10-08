import { Route, Routes } from 'react-router-dom';
import { BottomNavigation } from './components/layouts/BottomNavigation';
import { Header } from './components/layouts/Header';
import { MobileLayout } from './components/layouts/MobileLayout';
import './index.css';
import { CheckWords } from './routes/check-words';
import { Home } from './routes/home';
import { Login } from './routes/login';
import { MyPage } from './routes/mypage';
import { WordUpload } from './routes/word-upload';

function App() {
  return (
    <MobileLayout>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/word-upload' element={<WordUpload />} />
        <Route path='/check-words' element={<CheckWords />} />
        <Route path='/mypage' element={<MyPage />} />
      </Routes>
      <BottomNavigation />
    </MobileLayout>
  );
}

export default App;
