import { useEffect, useMemo, useState } from 'react'

const IDLE_FRAME_COUNT = 4
const SPRITE_COLUMNS = 4
const SPRITE_SHEET_WIDTH = 192
const SPRITE_SHEET_HEIGHT = 192
const SPRITE_CELL_SIZE = 48
const SPRITE_SCALE = 3
const IDLE_ROW = 0
const CAT_SPRITE_URL =
  '/model/Sprout%20Lands%20-%20Sprites%20-%20Basic%20pack/Characters/Basic%20Charakter%20Spritesheet.png'

type CatMode = 'idle' | 'pat'

function PointerCat() {
  const [frame, setFrame] = useState(0)
  const [mode, setMode] = useState<CatMode>('idle')
  const [hasIntroLoaded, setHasIntroLoaded] = useState(false)

  const updateMode = (nextMode: CatMode) => {
    setMode(nextMode)
  }

  useEffect(() => {
    const frameDuration = mode === 'idle' ? 180 : 110
    const animation = window.setInterval(() => {
      setFrame((currentFrame) => (currentFrame + 1) % IDLE_FRAME_COUNT)
    }, frameDuration)

    return () => window.clearInterval(animation)
  }, [mode])

  useEffect(() => {
    const intro = window.setTimeout(() => setHasIntroLoaded(true), 1360)

    return () => window.clearTimeout(intro)
  }, [])

  const spriteStyle = useMemo(() => {
    const sourceX = (frame % SPRITE_COLUMNS) * SPRITE_CELL_SIZE * SPRITE_SCALE
    const sourceY = IDLE_ROW * SPRITE_CELL_SIZE * SPRITE_SCALE

    return {
      backgroundImage: `url(${CAT_SPRITE_URL})`,
      backgroundSize: `${SPRITE_SHEET_WIDTH * SPRITE_SCALE}px ${SPRITE_SHEET_HEIGHT * SPRITE_SCALE}px`,
      backgroundPosition: `-${sourceX}px -${sourceY}px`,
    }
  }, [frame])

  return (
    <button
      className={`pointer-cat ${hasIntroLoaded ? '' : 'pointer-cat-loading'} ${mode === 'pat' ? 'pointer-cat-patted' : ''}`}
      style={spriteStyle}
      type="button"
      aria-label="Pat the Sprout Lands cat"
      onPointerEnter={() => updateMode('pat')}
      onPointerLeave={() => updateMode('idle')}
    />
  )
}

export default PointerCat
