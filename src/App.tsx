import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Home = lazy(() => import('./routes/Home'));
const Devices = lazy(() => import('./routes/Devices'));
const Features = lazy(() => import('./routes/Features'));
const Benchmark = lazy(() => import('./routes/Benchmark'));
const NotFound = lazy(() => import('./routes/NotFound'));

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="devices" element={<Devices />} />
          <Route path="features" element={<Features />} />
          <Route path="benchmark" element={<Benchmark />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
