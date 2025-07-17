import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import WhiteRoom from './components/WhiteRoom'
import ModelSpawner from './components/ModelSpawner'
import CameraRig from './components/CameraRig'
import InspectModal from './components/InspectModal'
import { Html } from '@react-three/drei'
import './App.css'

const models = [
  { id: 1, color: 'red' },
  { id: 2, color: 'blue' },
  { id: 3, color: 'green' },
  { id: 4, color: 'orange' },
  { id: 5, color: 'purple' },
  { id: 6, color: 'yellow' },
  { id: 7, color: 'pink' },
  { id: 8, color: 'teal' },
  { id: 9, color: 'brown' },
  { id: 10, color: 'gray' },
]

function App() {
  const [activeModel, setActiveModel] = useState(null)
  const [queuedModel, setQueuedModel] = useState(null)
  const [gridMinimized, setGridMinimized] = useState(false)
  const [isInspecting, setIsInspecting] = useState(false)
  const [modelCentered, setModelCentered] = useState(false)
  const [inspectBtnVisible, setInspectBtnVisible] = useState(false)
  const [inspectBtnFade, setInspectBtnFade] = useState(false)
  const [modelFrozen, setModelFrozen] = useState(false)

  // Handle color selection
  const handleClick = (model) => {
    setGridMinimized(true)
    setModelCentered(false)
    setInspectBtnVisible(false)
    setInspectBtnFade(false)
    setModelFrozen(false) // allow animation for new color
    if (activeModel) {
      // Remove current model, queue next
      setQueuedModel({ ...model, remove: false, _id: Date.now() })
      setActiveModel({ ...activeModel, remove: true, _id: Date.now() + 1 })
    } else {
      // Show directly
      setActiveModel({ ...model, remove: false, _id: Date.now() })
    }
  }

  // When model is despawned, show queued model
  const handleModelDespawned = () => {
    if (queuedModel) {
      setActiveModel({ ...queuedModel, remove: false })
      setQueuedModel(null)
    }
  }

  // Called by ModelSpawner when model is centered
  const handleModelCentered = () => {
    setModelCentered(true)
    setModelFrozen(true) // freeze after first arrival
    setInspectBtnVisible(true)
    setTimeout(() => setInspectBtnFade(true), 100) // fade-in after short delay
  }

  // When entering/exiting inspect mode, reset fade
  const handleInspectOpen = () => {
    setIsInspecting(true)
  }
  const handleInspectClose = () => {
    setIsInspecting(false)
    // No re-animation, keep freeze
    setTimeout(() => {
      setInspectBtnFade(true)
    }, 100)
  }

  return (
    <div className="app-container">
      <Canvas shadows camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          <CameraRig active={true} />
          <WhiteRoom />
          {activeModel && (
            <ModelSpawner
              model={activeModel}
              onDespawn={handleModelDespawned}
              onCentered={handleModelCentered}
              freeze={modelFrozen || isInspecting}
            />
          )}
        </Suspense>
        {/* Inspect button: only when model is centered, not inspecting, with fade-in */}
        {activeModel && !isInspecting && modelCentered && inspectBtnVisible && (
          <Html position={[0, -0.8, 0]} center>
            <button
              className={`inspect-btn ${inspectBtnFade ? 'fade-in' : ''}`}
              onClick={handleInspectOpen}
            >
              Inspect
            </button>
          </Html>
        )}
      </Canvas>

      {/* UI: Only show if not inspecting */}
      {!isInspecting && (
        <div className={`fullscreen-grid ${gridMinimized ? 'minimized' : ''}`}>
          {models.map((model) => (
            <button
              key={model.id}
              className="grid-button"
              style={{ '--btn-color': model.color }}
              onClick={() => handleClick(model)}
            >
              {model.color}
            </button>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {isInspecting && activeModel && (
        <InspectModal
          model={activeModel}
          onClose={handleInspectClose}
        />
      )}
    </div>
  )
}

export default App
