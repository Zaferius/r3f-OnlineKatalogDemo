import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ModelSpawner spawns or despawns a model with animation. Notifies parent when centered (ready for inspect).
// If freeze is true, model is instantly centered and does not animate.
const ModelSpawner = ({ model, onDespawn, onCentered, freeze }) => {
  const groupRef = useRef()
  const meshRef = useRef()

  const [phase, setPhase] = useState(null) // 0: curve out, 1: despawn
  const [t, setT] = useState(0)
  const [centered, setCentered] = useState(false)

  const isSpawning = !model.remove
  const isDespawning = model.remove

  // Curve definition (J shape)
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.5, 0),         // Start
    new THREE.Vector3(0, 0.5, 2),         // Out in Z
    new THREE.Vector3(2, 0.5, 2),         // Right corner
    new THREE.Vector3(2, 0.5, -10)        // Back down
  )

  // Initial position
  useEffect(() => {
    setCentered(false);
    if (freeze) {
      // Instantly center if freeze is true
      groupRef.current.position.set(0, 0.5, 0);
      groupRef.current.rotation.y = 0;
      setCentered(true);
      if (onCentered) onCentered();
      return;
    }
    if (isSpawning) {
      setT(0)
      setPhase(null)
      groupRef.current.position.set(0, 0.5, -10)
      groupRef.current.rotation.y = 0
    }
    if (isDespawning) {
      setT(0)
      setPhase(0)
      groupRef.current.position.set(0, 0.5, 0)
      groupRef.current.rotation.y = 0
    }
  }, [model, freeze])

  // Animation loop
  useFrame(() => {
    if (!groupRef.current || freeze) return

    // === DESPAWN ANIMATION ===
    if (isDespawning && phase === 0) {
      const nextT = Math.min(t + 0.02, 1)
      setT(nextT)

      const point = curve.getPoint(nextT)
      const tangent = curve.getTangent(nextT)
      const angle = Math.atan2(tangent.x, tangent.z)

      groupRef.current.position.copy(point)
      groupRef.current.rotation.y = angle

      if (nextT >= 1) {
        setPhase(1)
        setT(0)
      }
      return
    }

    // === DESPAWN END ===
    if (isDespawning && phase === 1) {
      onDespawn?.()
    }

    // === SPAWN ===
    if (isSpawning && groupRef.current.position.z < -0.15) {
      groupRef.current.position.z += 0.1
      if (groupRef.current.position.z >= -0.15 && !centered) {
        setCentered(true);
        if (onCentered) onCentered();
      }
    } else if (isSpawning && groupRef.current.position.z >= -0.15 && !centered) {
      setCentered(true);
      if (onCentered) onCentered();
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={model.color} />
      </mesh>
    </group>
  )
}

export default ModelSpawner
