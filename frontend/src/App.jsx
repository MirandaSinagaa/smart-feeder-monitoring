import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WaterQuality from './pages/WaterQuality';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Logs from './pages/Logs';
import Schedules from './pages/Schedules';
import SpreadsheetView from './pages/SpreadsheetView';
import Cultivation from './pages/Cultivation';
import { SensorProvider } from './context/SensorContext';
import { ThemeProvider } from './context/ThemeContext';

const TITLE_MAP = {
  '/dashboard': 'Dashboard',
  '/monitoring': 'Kualitas Air & Monitoring',
  '/water-quality': 'Kualitas Air & Monitoring',
  '/cultivation': 'Budidaya Bioflok',
  '/pencatatan-data': 'Budidaya Bioflok',
  '/logs': 'Riwayat Sensor',
  '/riwayat': 'Riwayat Sensor',
  '/settings': 'Pengaturan',
  '/pengaturan': 'Pengaturan',
  '/schedules': 'Jadwal Pakan',
  '/spreadsheet': 'Spreadsheet',
  '/profile': 'Profil Pengelola',
  '/login': 'Masuk Akun',
  '/signin': 'Masuk Akun',
  '/sign-in': 'Masuk Akun',
  '/signup': 'Daftar Akun',
  '/sign-up': 'Daftar Akun',
  '/register': 'Daftar Akun',
};

function PageTitleWatcher() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let pageName = TITLE_MAP[path];

    if (!pageName) {
      if (path.startsWith('/cultivation') || path.startsWith('/pencatatan-data')) {
        pageName = 'Budidaya Bioflok';
      } else {
        pageName = 'Bioflok IoT Management';
      }
    }

    document.title = `Smart Feeder | ${pageName}`;
  }, [location.pathname]);

  return null;
}

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <SensorProvider>
        <BrowserRouter>
        <PageTitleWatcher />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/sign-up" element={<Register />} />
          <Route path="/register" element={<Register />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Navigasi Baru: Monitoring (Kondisi Sistem & Kualitas Air) */}
            <Route path="/monitoring" element={<WaterQuality />} />
            <Route path="/water-quality" element={<WaterQuality />} />
            <Route path="/analytics" element={<Navigate to="/monitoring" replace />} />

            {/* Navigasi Baru: Pencatatan Data Budidaya (5 Sheet Google Sheets) */}
            <Route path="/cultivation" element={<Cultivation />} />
            <Route path="/cultivation/:tab" element={<Cultivation />} />
            <Route path="/pencatatan-data" element={<Cultivation />} />
            <Route path="/pencatatan-data/:tab" element={<Cultivation />} />

            {/* Navigasi Baru: Riwayat & Log Telemetri */}
            <Route path="/logs" element={<Logs />} />
            <Route path="/riwayat" element={<Logs />} />

            {/* Navigasi Baru: Pengaturan */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/pengaturan" element={<Settings />} />

            {/* Halaman Pendukung */}
            <Route path="/spreadsheet" element={<SpreadsheetView />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/schedules" element={<Schedules />} />
          </Route>

          <Route path="*" element={
            localStorage.getItem('user') ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </BrowserRouter>
    </SensorProvider>
  </ThemeProvider>
  );
}

export default App;
