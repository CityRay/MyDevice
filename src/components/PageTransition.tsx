import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<'enter' | 'exit'>('enter');
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (location.key === prevKey.current) return;
    prevKey.current = location.key;
    setStage('exit');
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setStage('enter');
    }, 200);
    return () => clearTimeout(timer);
  }, [location.key, children]);

  // Sync children when same route (e.g. first render)
  useEffect(() => {
    if (stage === 'enter') {
      setDisplayChildren(children);
    }
  }, [children, stage]);

  return (
    <div
      className={`transition-all duration-200 ease-in-out ${
        stage === 'enter' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {displayChildren}
    </div>
  );
}
