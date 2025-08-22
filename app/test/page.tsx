import { BasenameTest } from '../../components/BasenameTest';
import { BasenameDebugger } from '../../components/BasenameDebugger';
import { IdentityExamples } from '../../components/IdentityExamples';

export default function TestPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="space-y-12">
        <BasenameDebugger />
        <BasenameTest />
        <IdentityExamples />
      </div>
    </main>
  );
}
