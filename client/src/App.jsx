import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CitizenApp from './apps/citizen/CitizenApp';
import AdminApp from './apps/admin/AdminApp';
import WorkerApp from './apps/worker/WorkerApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/worker/*" element={<WorkerApp />} />
        <Route path="/*" element={<CitizenApp />} />
      </Routes>
    </BrowserRouter>
  );
}
