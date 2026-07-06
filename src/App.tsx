import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RealtimeDetection } from '@/pages/RealtimeDetection';
import { Statistics } from '@/pages/Statistics';
import { Settings } from '@/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RealtimeDetection />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
