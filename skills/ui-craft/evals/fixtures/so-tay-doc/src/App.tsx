import type { ComponentType } from 'react';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';

// Minimal path routing; add pages here.
const routes: Record<string, ComponentType> = {
  '/': Home,
};

export default function App() {
  const Page = routes[window.location.pathname] ?? Home;
  return (
    <Shell>
      <Page />
    </Shell>
  );
}
