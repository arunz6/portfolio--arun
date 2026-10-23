import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch { return false }
}

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? null : this.props.children }
}

function seededRandom(seed) {
  let value = seed
  return () => { value = (value * 48271) % 2147483647; return (value - 1) / 2147483646 }
}

async function createTypographyParticles(count, aspect, mobile) {
  await Promise.all([
    document.fonts.load('700 176px "Space Grotesk"'),
    document.fonts.load('500 38px Inter'),
  ])

  const width = 1600
  const height = 440
  const bitmap = document.createElement('canvas')
  bitmap.width = width
  bitmap.height = height
  const context = bitmap.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Typography mask could not be created')

  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '700 176px "Space Grotesk", sans-serif'
  context.fillText('FULL STACK', width / 2, 155, width - 90)
  context.font = `700 ${mobile ? 104 : 132}px "Space Grotesk", sans-serif`
  context.letterSpacing = '5px'
  context.fillText('DEVELOPER', width / 2, 320, width - 120)

  const pixels = context.getImageData(0, 0, width, height).data
  const nameCandidates = []
  const subtitleCandidates = []
  const step = 4
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (pixels[(y * width + x) * 4 + 3] > 96) {
        ;(y > 245 ? subtitleCandidates : nameCandidates).push([x, y])
      }
    }
  }
  if (!nameCandidates.length || !subtitleCandidates.length) throw new Error('Typography mask is incomplete')

  const random = seededRandom(684239)
  const shuffle = (items) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
  }
  shuffle(nameCandidates)
  shuffle(subtitleCandidates)
  const nameCount = Math.round(count * 0.82)

  const visibleWidth = 2 * 8 * Math.tan(THREE.MathUtils.degToRad(42 / 2)) * aspect
  const worldWidth = Math.min(9, visibleWidth * 0.92)
  const scale = worldWidth / width
  const targets = new Float32Array(count * 3)
  const starts = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const arrivals = new Float32Array(count)
  const phases = new Float32Array(count)
  const palette = ['#FFFFFF', '#E3E3E3', '#BDBDBD', '#888888'].map((hex) => new THREE.Color(hex))
  const visibleHeight = visibleWidth / aspect

  for (let i = 0; i < count; i++) {
    const pool = i < nameCount ? nameCandidates : subtitleCandidates
    const poolIndex = i < nameCount ? i : i - nameCount
    const [px, py] = pool[poolIndex % pool.length]
    const k = i * 3
    const tx = (px - width / 2) * scale
    const ty = (height / 2 - py) * scale
    const tz = (random() - 0.5) * 0.14
    targets[k] = tx; targets[k + 1] = ty; targets[k + 2] = tz

    const edge = Math.floor(random() * 4)
    if (edge < 2) {
      starts[k] = (edge === 0 ? -1 : 1) * (visibleWidth * (0.55 + random() * 0.45))
      starts[k + 1] = (random() - 0.5) * visibleHeight * 1.5
    } else {
      starts[k] = (random() - 0.5) * visibleWidth * 1.6
      starts[k + 1] = (edge === 2 ? -1 : 1) * (visibleHeight * (0.58 + random() * 0.45))
    }
    starts[k + 2] = (random() - 0.5) * 3.4

    const angle = random() * Math.PI * 2
    const distance = visibleWidth * (0.32 + random() * 0.52)
    scatter[k] = tx + Math.cos(angle) * distance
    scatter[k + 1] = ty + Math.sin(angle) * distance
    scatter[k + 2] = tz + (random() - 0.5) * 3.5
    sizes[i] = mobile ? 0.0065 + random() * 0.004 : 0.007 + random() * 0.0045
    arrivals[i] = random() * 0.6
    phases[i] = random() * Math.PI * 2

    const color = palette[Math.floor(random() * palette.length)]
    colors[k] = color.r; colors[k + 1] = color.g; colors[k + 2] = color.b
  }

  return { targets, starts, scatter, colors, sizes, arrivals, phases }
}

function ScreenDust({ mobile, reducedMotion }) {
  const mesh = useRef(null)
  const { camera, size } = useThree()
  const count = mobile ? 110 : 280
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const dots = useMemo(() => {
    const random = seededRandom(90472)
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
    const visibleWidth = visibleHeight * size.width / Math.max(size.height, 1)
    return Array.from({ length: count }, () => ({
      x: (random() - 0.5) * visibleWidth,
      y: (random() - 0.5) * visibleHeight,
      z: -1.8 - random() * 2.8,
      radius: 0.0035 + random() * 0.004,
      phase: random() * Math.PI * 2,
      speed: 0.035 + random() * 0.07,
      drift: 0.025 + random() * 0.055,
    }))
  }, [camera.fov, camera.position.z, count, size.height, size.width])

  useFrame((_, delta) => {
    if (!mesh.current || reducedMotion) return
    const time = performance.now() / 1000
    for (let i = 0; i < count; i++) {
      const dot = dots[i]
      dummy.position.set(dot.x + Math.sin(time * dot.speed + dot.phase) * dot.drift, dot.y + Math.cos(time * dot.speed * 0.8 + dot.phase) * dot.drift, dot.z)
      const variation = 1 + Math.sin(time * 0.7 + dot.phase) * 0.02
      dummy.scale.setScalar(dot.radius * variation)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    if (!mesh.current) return
    for (let i = 0; i < count; i++) {
      const dot = dots[i]
      dummy.position.set(dot.x, dot.y, dot.z)
      dummy.scale.setScalar(dot.radius)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [count, dots, dummy])

  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
    <sphereGeometry args={[1, 5, 4]} />
    <meshBasicMaterial color="#BDBDBD" transparent opacity={0.42} depthWrite={false} />
  </instancedMesh>
}

function PointerField({ interaction, groupRef, visible, reducedMotion }) {
  const { camera, gl } = useThree()
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const inverse = useMemo(() => new THREE.Matrix4(), [])
  const ray = useMemo(() => new THREE.Ray(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const localPoint = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!visible) return undefined
    const move = (event) => {
      const rect = gl.domElement.getBoundingClientRect()
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
      if (!inside || !rect.width || !rect.height) {
        interaction.current.active = false
        return
      }

      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      if (!groupRef.current) return
      groupRef.current.updateMatrixWorld(true)
      inverse.copy(groupRef.current.matrixWorld).invert()
      ray.copy(raycaster.ray).applyMatrix4(inverse)
      if (!ray.intersectPlane(plane, localPoint)) return

      const state = interaction.current
      const now = performance.now() / 1000
      const moved = Math.hypot(localPoint.x - state.x, localPoint.y - state.y)
      state.x = localPoint.x; state.y = localPoint.y; state.z = localPoint.z
      state.active = event.pointerType !== 'touch' || event.buttons > 0
      if (!reducedMotion && (moved > 0.045 || event.type === 'pointerdown') && now - state.lastTrail > 0.045) {
        state.trail.push({ x: localPoint.x, y: localPoint.y, time: now })
        if (state.trail.length > 4) state.trail.shift()
        state.lastTrail = now
      }
    }
    const releaseTouch = (event) => { if (event.pointerType === 'touch') interaction.current.active = false }
    const release = () => { interaction.current.active = false }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', move, { passive: true })
    window.addEventListener('pointerup', releaseTouch, { passive: true })
    window.addEventListener('pointercancel', releaseTouch, { passive: true })
    window.addEventListener('pointerleave', release, { passive: true })
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', move)
      window.removeEventListener('pointerup', releaseTouch)
      window.removeEventListener('pointercancel', releaseTouch)
      window.removeEventListener('pointerleave', release)
      window.removeEventListener('blur', release)
    }
  }, [camera, gl, groupRef, interaction, inverse, localPoint, plane, pointer, ray, raycaster, reducedMotion, visible])

  return null
}

function ParticleTypography({ mobile, reducedMotion, visible, interaction, onReady, onError, onIntroComplete, revealRef }) {
  const groupRef = useRef(null)
  const mesh = useRef(null)
  const state = useRef({ formation: 0, shatter: 0 })
  const timeline = useRef(null)
  const { camera, invalidate, size } = useThree()
  const count = mobile ? 1800 : 4600
  const [data, setData] = useState(null)
  const physics = useMemo(() => data ? ({
    positions: new Float32Array(data.starts),
    velocities: new Float32Array(count * 3),
  }) : null, [count, data])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  const visibleRef = useRef(visible)

  useEffect(() => {
    visibleRef.current = visible
    if (visible) invalidate()
  }, [invalidate, visible])

  useEffect(() => {
    let cancelled = false
    createTypographyParticles(count, size.width / Math.max(size.height, 1), mobile)
      .then((particles) => {
        if (cancelled) return
        setData(particles)
        onReady?.()
      })
      .catch(() => { if (!cancelled) onError?.() })
    return () => { cancelled = true }
  }, [count, mobile, onError, onReady, size.height, size.width])

  useEffect(() => {
    if (!data || !mesh.current) return undefined
    for (let i = 0; i < count; i++) {
      color.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2])
      mesh.current.setColorAt(i, color)
    }
    mesh.current.instanceColor.needsUpdate = true

    const scene = state.current
    scene.formation = 0
    scene.shatter = 0
    const introEnd = 3.7
    const fullDuration = 8.2
    const shatterEnd = 4.5
    const master = gsap.timeline({ paused: true, onUpdate: () => { if (visibleRef.current) invalidate() } })
      .to(scene, { formation: 1, duration: introEnd, ease: 'power3.inOut' }, 0)
      .to(scene, { shatter: 1, duration: shatterEnd, ease: 'power1.in' }, introEnd)
    if (revealRef?.current) {
      const beats = revealRef.current.querySelectorAll('.hero__beat')
      const offsets = [0.14, 1.22, 2.3, 3.1]
      beats.forEach((beat, index) => {
        const start = introEnd + offsets[index]
        master.fromTo(beat, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.48, ease: 'power3.out', immediateRender: false }, start)
        master.to(beat, { autoAlpha: 0, y: -16, duration: 0.28, ease: 'power2.in' }, start + 0.8)
      })
    }
    timeline.current = master

    let trigger
    let scrollReady = false
    let initialSeek = 0
    const bindScroll = () => {
      master.pause(introEnd)
      onIntroComplete?.()
      trigger = ScrollTrigger.create({
        trigger: document.getElementById('top'),
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          if (!scrollReady) return
          master.progress((introEnd + self.progress * (fullDuration - introEnd)) / fullDuration).pause()
          if (visibleRef.current) invalidate()
        },
      })
      initialSeek = requestAnimationFrame(() => {
        if (!trigger) return
        scrollReady = true
        master.progress((introEnd + trigger.progress * (fullDuration - introEnd)) / fullDuration).pause()
        if (visibleRef.current) invalidate()
      })
    }
    master.call(bindScroll, [], introEnd)

    if (reducedMotion) {
      scene.formation = 1
      scene.shatter = 0
      master.progress(introEnd / fullDuration).pause()
      bindScroll()
      return () => { cancelAnimationFrame(initialSeek); scrollReady = false; trigger?.kill(); master.kill(); timeline.current = null }
    }

    master.play(0)
    return () => {
      cancelAnimationFrame(initialSeek)
      scrollReady = false
      trigger?.kill()
      master.kill()
      timeline.current = null
    }
  }, [color, count, data, invalidate, onIntroComplete, reducedMotion, revealRef])

  useFrame((_, delta) => {
    if (!mesh.current || !data || !physics) return
    const dt = Math.min(delta, 0.04)
    const damping = Math.exp(-10 * dt)
    const now = performance.now() / 1000
    const cursor = interaction.current
    const repelRadius = mobile ? 0.46 : 0.58
    const { formation, shatter } = state.current

    for (let i = 0; i < count; i++) {
      const k = i * 3
      const arrival = THREE.MathUtils.clamp((formation - data.arrivals[i] * 0.42) / (1 - data.arrivals[i] * 0.42), 0, 1)
      const eased = arrival * arrival * (3 - 2 * arrival)
      const formedX = THREE.MathUtils.lerp(data.starts[k], data.targets[k], eased)
      const formedY = THREE.MathUtils.lerp(data.starts[k + 1], data.targets[k + 1], eased)
      const formedZ = THREE.MathUtils.lerp(data.starts[k + 2], data.targets[k + 2], eased)
      const baseX = THREE.MathUtils.lerp(formedX, data.scatter[k], shatter)
      const baseY = THREE.MathUtils.lerp(formedY, data.scatter[k + 1], shatter)
      const baseZ = THREE.MathUtils.lerp(formedZ, data.scatter[k + 2], shatter)
      const internalMotion = (1 - shatter) * Math.min(formation, 1) * (reducedMotion ? 0 : 1)
      const phase = data.phases[i]
      const innerX = Math.sin(now * 0.72 + phase) * 0.006 * internalMotion
      const innerY = Math.cos(now * 0.61 + phase * 1.3) * 0.006 * internalMotion

      let x = physics.positions[k], y = physics.positions[k + 1], z = physics.positions[k + 2]
      let vx = physics.velocities[k], vy = physics.velocities[k + 1], vz = physics.velocities[k + 2]
      let ax = (baseX + innerX - x) * 48
      let ay = (baseY + innerY - y) * 48
      let az = (baseZ - z) * 48

      if (!reducedMotion && cursor.active && formation > 0.82 && shatter < 0.94) {
        let dx = x - cursor.x, dy = y - cursor.y, dz = z - cursor.z
        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (distance < repelRadius) {
          if (distance < 0.001) { dx = Math.cos(i * 2.399); dy = Math.sin(i * 2.399); distance = 1 }
          const t = 1 - distance / repelRadius
          const force = t * t * (3 - 2 * t) * 18
          ax += dx / distance * force
          ay += dy / distance * force
          az += dz / distance * force * 0.22
        }
      }

      if (!reducedMotion && shatter < 0.94 && cursor.trail.length) {
        for (let trail = cursor.trail.length - 1; trail >= 0; trail--) {
          const stamp = cursor.trail[trail]
          const age = now - stamp.time
          if (age > 0.9) { cursor.trail.splice(trail, 1); continue }
          const dx = x - stamp.x, dy = y - stamp.y
          const distanceSq = dx * dx + dy * dy
          if (distanceSq > 0.64) continue
          const distance = Math.sqrt(distanceSq) + 0.001
          const ripple = Math.sin(distance * 24 - age * 12) * Math.exp(-distance * 4.2) * Math.exp(-age * 3.5)
          const force = ripple * 3.6
          ax += dx / distance * force
          ay += dy / distance * force
        }
      }

      if (reducedMotion) {
        x = baseX; y = baseY; z = baseZ; vx = 0; vy = 0; vz = 0
      } else {
        vx = (vx + ax * dt) * damping
        vy = (vy + ay * dt) * damping
        vz = (vz + az * dt) * damping
        x += vx * dt; y += vy * dt; z += vz * dt
        const ox = x - baseX, oy = y - baseY, oz = z - baseZ
        const offsetLength = Math.sqrt(ox * ox + oy * oy + oz * oz)
        if (offsetLength > 0.48) {
          const scale = 0.48 / offsetLength
          x = baseX + ox * scale; y = baseY + oy * scale; z = baseZ + oz * scale
          vx *= 0.4; vy *= 0.4; vz *= 0.4
        }
      }

      physics.positions[k] = x; physics.positions[k + 1] = y; physics.positions[k + 2] = z
      physics.velocities[k] = vx; physics.velocities[k + 1] = vy; physics.velocities[k + 2] = vz
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(data.sizes[i])
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true

    // Small pointer parallax is intentionally separate from the ScrollTrigger playhead.
    if (!reducedMotion) {
      const parallaxX = THREE.MathUtils.clamp(cursor.x * 0.018, -0.08, 0.08)
      const parallaxY = THREE.MathUtils.clamp(cursor.y * 0.012, -0.05, 0.05)
      groupRef.current.position.x = parallaxX
      groupRef.current.position.y = parallaxY
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {data && (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
          <sphereGeometry args={[1, 7, 6]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.38} roughness={0.34} />
        </instancedMesh>
      )}
      <PointerField interaction={interaction} groupRef={groupRef} visible={visible} reducedMotion={reducedMotion} />
    </group>
  )
}

export default function Hero3D({ onReady, onIntroComplete, onError, revealRef }) {
  const [visible, setVisible] = useState(true)
  const [webglAvailable] = useState(() => hasWebGL())
  const host = useRef(null)
  const interaction = useRef({ x: 0, y: 0, z: 0, active: false, lastTrail: 0, trail: [] })
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700

  useEffect(() => {
    const node = host.current
    if (!node || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (webglAvailable) return undefined
    onError?.()
    return undefined
  }, [onError, onIntroComplete, onReady, webglAvailable])

  if (!webglAvailable) return null

  return (
    <div className="hero__canvas" ref={host}>
      <Boundary onError={onError}>
        <Canvas frameloop={visible && !reducedMotion ? 'always' : 'demand'} dpr={mobile ? 1 : [1, 1.35]} camera={{ position: [0, 0, 8], fov: 42 }} gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}>
          <color attach="background" args={['#090909']} />
          <ambientLight intensity={0.52} />
          <directionalLight position={[2, 3, 5]} intensity={2.2} color="#FFFFFF" />
          <pointLight position={[-3, 1, 3]} intensity={2.8} color="#D5D5D5" />
          <ScreenDust mobile={mobile} reducedMotion={reducedMotion} />
          <ParticleTypography mobile={mobile} reducedMotion={reducedMotion} visible={visible} interaction={interaction} onReady={onReady} onError={onError} onIntroComplete={onIntroComplete} revealRef={revealRef} />
        </Canvas>
      </Boundary>
    </div>
  )
}
