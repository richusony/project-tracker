import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import NotesList from './pages/NotesList';
import NoteDetail from './pages/NoteDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/notes" element={<NotesList />} />
          <Route path="projects/:id/notes/:noteId" element={<NoteDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
