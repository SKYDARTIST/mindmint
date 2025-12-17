import type { MindmapLayout } from "../types";
import LandingPage from './LandingPage';

const MINDMAP_LAYOUTS: { id: MindmapLayout; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'flow', label: 'Flow' },
  { id: 'layered', label: 'Layered' },
  { id: 'chain', label: 'Chain' },
];

function MindMintApp() {
  const handleStart = () => {
    // TODO: Implement start functionality
    console.log('Starting MindMint...');
  };

  const handleExample = () => {
    // TODO: Implement example functionality
    console.log('Loading example...');
  };

  const toggleTheme = () => {
    // TODO: Implement theme toggle
    console.log('Toggling theme...');
  };

  return (
    <LandingPage
      onStart={handleStart}
      onExample={handleExample}
      toggleTheme={toggleTheme}
      theme="light"
    />
  );
}

export default MindMintApp;