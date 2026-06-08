import { useEffect, useRef } from 'react'
import { Center, Environment, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'

const INITIAL_HAND_ROTATION: [number, number, number] = [2.3, 1.0, 7.0]
const INITIAL_HAND_SCALE = 17.2
const INITIAL_HAND_LANDING: [number, number] = [0.12, 0.14]

declare global {
  interface Window {
    hand?: Group
    setHandRotation?: (x: number, y: number, z: number) => void
    setHandScale?: (scale: number) => void
    setHandLanding?: (x: number, y: number) => void
  }
}

function HeroHandModel() {
  const groupRef = useRef<Group>(null)
  const elapsedRef = useRef(0)
  const hoverAmountRef = useRef(0)
  const isHoveredRef = useRef(false)
  const baseRotationRef = useRef<[number, number, number]>(INITIAL_HAND_ROTATION)
  const landingRef = useRef<[number, number]>(INITIAL_HAND_LANDING)
  const baseScaleRef = useRef(INITIAL_HAND_SCALE)
  const { scene } = useGLTF('/model/hand.glb')

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh

      if (!mesh.isMesh) return

      const blueSkin = mesh.material as MeshStandardMaterial
      blueSkin.color.set('#3f7df4')
      blueSkin.roughness = 0.62
      blueSkin.metalness = 0.04
    })
  }, [scene])

  useEffect(() => {
    window.hand = groupRef.current ?? undefined
    window.setHandRotation = (x: number, y: number, z: number) => {
      baseRotationRef.current = [x, y, z]
      groupRef.current?.rotation.set(x, y, z)
    }
    window.setHandScale = (scale: number) => {
      baseScaleRef.current = scale
      groupRef.current?.scale.setScalar(scale)
    }
    window.setHandLanding = (x: number, y: number) => {
      landingRef.current = [x, y]
    }

    return () => {
      delete window.hand
      delete window.setHandRotation
      delete window.setHandScale
      delete window.setHandLanding
      document.body.style.cursor = ''
    }
  }, [])

  useFrame(({ viewport, pointer }, delta) => {
    if (!groupRef.current) return

    elapsedRef.current += delta
    hoverAmountRef.current +=
      ((isHoveredRef.current ? 1 : 0) - hoverAmountRef.current) * Math.min(delta * 8, 1)

    const duration = 2.15
    const progress = Math.min(elapsedRef.current / duration, 1)
    const eased =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

    const startX = -viewport.width * 0.68
    const startY = viewport.height * 0.56
    const [landingX, landingY] = landingRef.current
    const endX = viewport.width * landingX
    const endY = viewport.height * landingY
    const idleFloat = progress === 1 ? Math.sin(elapsedRef.current * 0.75) * 0.06 : 0
    const hoverAmount = hoverAmountRef.current
    const hoverX = pointer.x * viewport.width * 0.035 * hoverAmount
    const hoverY = pointer.y * viewport.height * 0.025 * hoverAmount
    const hoverFloat = Math.sin(elapsedRef.current * 3.2) * 0.08 * hoverAmount

    groupRef.current.position.set(
      startX + (endX - startX) * eased + hoverX,
      startY + (endY - startY) * eased + idleFloat + hoverY + hoverFloat,
      0,
    )

    const [baseX, baseY, baseZ] = baseRotationRef.current
    groupRef.current.rotation.x = baseX - Math.sin(progress * Math.PI) * 0.08 + pointer.y * 0.08 * hoverAmount
    groupRef.current.rotation.y = baseY + Math.sin(elapsedRef.current * 0.42) * 0.035 + pointer.x * 0.1 * hoverAmount
    groupRef.current.rotation.z = baseZ + Math.sin(elapsedRef.current * 0.55) * 0.035 + pointer.x * 0.06 * hoverAmount
    groupRef.current.scale.setScalar(baseScaleRef.current + hoverAmount * 0.55)
  })

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[1.5, 3.5, 4]} intensity={2.2} />
      <directionalLight position={[-3, 1, 2]} intensity={0.7} color="#dce8ff" />
      <Environment preset="studio" />
      <group
        ref={groupRef}
        rotation={INITIAL_HAND_ROTATION}
        scale={INITIAL_HAND_SCALE}
        onPointerOver={(event) => {
          event.stopPropagation()
          isHoveredRef.current = true
          document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          isHoveredRef.current = false
          document.body.style.cursor = ''
        }}
      >
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </>
  )
}

useGLTF.preload('/model/hand.glb')

export default HeroHandModel
