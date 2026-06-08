import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroHandModel from './HeroHandModel'

type BlueHandProps = {
  hasLanded: boolean
}

function BlueHand({ hasLanded }: BlueHandProps) {
  return (
    <div className={`hand-stage ${hasLanded ? 'hand-stage-landed' : ''}`} aria-hidden="true">
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 34 }}>
        <Suspense fallback={null}>
          <HeroHandModel />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default BlueHand
