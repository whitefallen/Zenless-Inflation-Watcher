import '@/app/patrol-log.css';
import { PatrolLogApp } from '@/components/patrol-log/app-shell';

export default function Home() {
  return (
    <div data-patrol-log="" style={{ minHeight: '100vh' }}>
      <PatrolLogApp />
    </div>
  );
}
