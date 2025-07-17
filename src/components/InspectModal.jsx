import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ModelSpawner from './ModelSpawner';
import './InspectModal.css';

export default function InspectModal({ model, onClose }) {
  return (
    <div className="inspect-modal">
      <button className="close-btn" onClick={onClose}>
        Exit
      </button>
      <div className="inspect-canvas-wrapper">
        <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <ModelSpawner model={{ ...model, remove: false }} />
          <OrbitControls enablePan={false} />
          <Environment preset="sunset" />
        </Canvas>
      </div>
    </div>
  );
}
