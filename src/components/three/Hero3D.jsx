import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

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
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// Deterministic points across the three strokes; each is a true sphere instance.
function createParticles(count) {
  let seed = 83472
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  const targets = new Float32Array(count * 3)
  const starts = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const arrivals = new Float32Array(count)
  const palette = ['#FFFFFF', '#DADADA', '#AFAFAF', '#777777'].map((hex) => new THREE.Color(hex))
  const leftCount = Math.round(count * 0.39)
  const rightCount = Math.round(count * 0.39)

  for (let i = 0; i < count; i++) {
    const segment = i < leftCount ? 0 : i < leftCount + rightCount ? 1 : 2
    const t = random()
    let x, y, nx, ny
    if (segment === 0) {
      x = THREE.MathUtils.lerp(-1.3, 0, t); y = THREE.MathUtils.lerp(-1.65, 1.65, t)
      nx = -0.93; ny = 0.37
    } else if (segment === 1) {
      x = THREE.MathUtils.lerp(0, 1.3, t); y = THREE.MathUtils.lerp(1.65, -1.65, t)
      nx = 0.93; ny = 0.37
    } else {
      x = THREE.MathUtils.lerp(-0.69, 0.69, t); y = -0.48
      nx = 0; ny = 1
    }
    const width = (random() - 0.5) * (segment === 2 ? 0.13 : 0.14)
    const depth = (random() - 0.5) * 0.42
    const k = i * 3
    targets[k] = x + nx * width
    targets[k + 1] = y + ny * width
    targets[k + 2] = depth
    const edge = Math.floor(random() * 4)
    if (edge < 2) {
      starts[k] = (edge === 0 ? -1 : 1) * (4.2 + random() * 4.5)
      starts[k + 1] = (random() - 0.5) * 7.5
    } else {
      starts[k] = (random() - 0.5) * 9
      starts[k + 1] = (edge === 2 ? -1 : 1) * (2.8 + random() * 4)
    }
    starts[k + 2] = (random() - 0.5) * 4
    sizes[i] = 0.012 + random() * 0.016
    arrivals[i] = random() * 0.62
    const color = palette[random() < 0.045 ? 1 : random() < 0.18 ? 2 : random() < 0.12 ? 3 : 0]
    colors[k] = color.r; colors[k + 1] = color.g; colors[k + 2] = color.b
  }
  return { targets, starts, sizes, colors, arrivals }
}

function createRidge(seed) {
  const shape = new THREE.Shape()
  const steps = 48
  let value = seed
  const random = () => { value = (value * 16807) % 2147483647; return (value - 1) / 2147483646 }
  shape.moveTo(-16, -2.8)
  shape.lineTo(-16, -1.45)
  for (let i = 0; i <= steps; i++) {
    const x = -16 + (i / steps) * 32
    const peak = -1.55 + Math.sin(i * 0.61 + seed) * 0.28 + Math.sin(i * 0.21 + seed) * 0.24 + random() * 0.52
    shape.lineTo(x, peak)
  }
  shape.lineTo(16, -2.8)
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

function MountainRange({ seed, z, color }) {
  const geometry = useMemo(() => createRidge(seed), [seed])
  return <mesh geometry={geometry} position={[0, 0, z]}><meshStandardMaterial color={color} roughness={1} metalness={0} /></mesh>
}

const waterVertex = `
  varying vec2 vCoord;
  void main() {
    vCoord = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const waterFragment = `
  uniform float uTime;
  uniform float uRippleTime;
  uniform vec2 uRippleCenter;
  varying vec2 vCoord;
  void main() {
    float t = uTime * 0.52;
    float waveA = sin(vCoord.x * 2.1 + t) * cos(vCoord.y * 1.25 - t * 0.72);
    float waveB = sin(vCoord.x * 4.8 - vCoord.y * 2.2 + t * 1.25);
    float age = uTime - uRippleTime;
    float distanceToTouch = distance(vCoord, uRippleCenter);
    float alive = step(0.0, age) * (1.0 - smoothstep(2.8, 4.2, age));
    float ring = sin(distanceToTouch * 12.0 - age * 5.2) * exp(-distanceToTouch * 0.52) * exp(-max(age, 0.0) * 0.72) * alive;
    float silver = 0.5 + 0.5 * sin(vCoord.x * 5.0 + vCoord.y * 3.3 + waveA * 1.8 + t);
    float light = 0.025 + abs(waveA) * 0.025 + abs(waveB) * 0.009 + max(ring, 0.0) * 0.18 + silver * 0.007;
    vec3 color = vec3(light);
    gl_FragColor = vec4(color, 1.0);
  }
`

function Lake({ interaction, reducedMotion }) {
  const material = useRef(null)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRippleTime: { value: -100 },
    uRippleCenter: { value: new THREE.Vector2(0, 0) },
  }), [])
  useFrame(() => {
    if (!material.current || reducedMotion) return
    const now = performance.now() / 1000
    uniforms.uTime.value = now
    uniforms.uRippleTime.value = interaction.current.last
    uniforms.uRippleCenter.value.set(interaction.current.x, 1 - interaction.current.z)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.27, 1]}>
      <planeGeometry args={[32, 26]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={waterVertex} fragmentShader={waterFragment} toneMapped={false} />
    </mesh>
  )
}

function PointerInteraction({ interaction, visible, reducedMotion }) {
  const { camera, gl, invalidate } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.27), [])
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!visible) return undefined
    const disturb = (event) => {
      const rect = gl.domElement.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.ray.intersectPlane(plane, point)
      if (!hit) return
      interaction.current.x = hit.x
      interaction.current.z = hit.z
      interaction.current.last = performance.now() / 1000
      if (reducedMotion) invalidate()
    }
    window.addEventListener('pointermove', disturb, { passive: true })
    window.addEventListener('pointerdown', disturb, { passive: true })
    return () => {
      window.removeEventListener('pointermove', disturb)
      window.removeEventListener('pointerdown', disturb)
    }
  }, [camera, gl, interaction, invalidate, plane, point, pointer, raycaster, reducedMotion, visible])
  return null
}

function DriftParticles({ interaction, mobile, reducedMotion }) {
  const mesh = useRef(null)
  const count = mobile ? 54 : 116
  const data = useMemo(() => {
    let seed = 92461
    const random = () => { seed = (seed * 48271) % 2147483647; return (seed - 1) / 2147483646 }
    const palette = ['#F1F1F1', '#C9C9C9', '#8D8D8D'].map((hex) => new THREE.Color(hex))
    return Array.from({ length: count }, () => ({
      x: (random() - 0.5) * 14,
      y: -0.65 + random() * 4.2,
      z: -3.8 + random() * 7.5,
      phase: random() * Math.PI * 2,
      speed: 0.14 + random() * 0.32,
      size: 0.018 + random() * 0.055,
      color: palette[Math.floor(random() * palette.length)],
      drift: 0.08 + random() * 0.3,
    }))
  }, [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!mesh.current) return undefined
    data.forEach((particle, i) => mesh.current.setColorAt(i, particle.color))
    mesh.current.instanceColor.needsUpdate = true
    return undefined
  }, [data])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const time = reducedMotion ? 0 : clock.elapsedTime
    const interactionAge = performance.now() / 1000 - interaction.current.last
    const impulse = !reducedMotion && interactionAge >= 0 && interactionAge < 2.2 ? 1 - interactionAge / 2.2 : 0
    for (let i = 0; i < count; i++) {
      const particle = data[i]
      let x = particle.x + Math.sin(time * particle.speed + particle.phase) * particle.drift
      let y = particle.y + Math.sin(time * particle.speed * 1.4 + particle.phase) * particle.drift * 0.55
      let z = particle.z + Math.cos(time * particle.speed + particle.phase) * particle.drift
      if (impulse) {
        const dx = x - interaction.current.x
        const dz = z - interaction.current.z
        const distance = Math.sqrt(dx * dx + dz * dz) + 0.001
        const force = Math.max(0, 1 - distance / 2.1) * impulse * 0.8
        x += (dx / distance) * force
        z += (dz / distance) * force
        y += force * 0.38
      }
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(particle.size * (1 + Math.sin(time * 1.6 + particle.phase) * (reducedMotion ? 0 : 0.12)))
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 7]} />
      <meshStandardMaterial color="#ffffff" metalness={0.18} roughness={0.35} />
    </instancedMesh>
  )
}

function ParticleA({ mobile, reducedMotion, visible, onIntroComplete }) {
  const mesh = useRef(null)
  const sweep = useRef(null)
  const cameraRig = useRef({ theta: -0.58, phi: Math.PI / 2.05, radius: mobile ? 6.6 : 5.55, progress: 0 })
  const pointer = useRef({ x: 0, y: 0 })
  const visibleRef = useRef(visible)
  const { camera, invalidate } = useThree()
  const count = mobile ? 720 : 3200
  const { targets, starts, sizes, colors, arrivals } = useMemo(() => createParticles(count), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  const clock = useRef(0)

  useEffect(() => {
    visibleRef.current = visible
    if (visible) invalidate()
  }, [invalidate, visible])

  useEffect(() => {
    const instance = mesh.current
    if (!instance) return undefined
    for (let i = 0; i < count; i++) {
      color.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
      instance.setColorAt(i, color)
    }
    instance.instanceColor.needsUpdate = true
    const cameraState = cameraRig.current
    const placeCamera = () => {
      camera.position.set(
        Math.sin(cameraState.theta) * Math.sin(cameraState.phi) * cameraState.radius,
        Math.cos(cameraState.phi) * cameraState.radius,
        Math.cos(cameraState.theta) * Math.sin(cameraState.phi) * cameraState.radius,
      )
      camera.lookAt(0, 0, 0)
    }
    placeCamera()
    let timeline
    if (!reducedMotion) {
      timeline = gsap.timeline({
        onUpdate: () => { if (visibleRef.current) invalidate() },
        onComplete: onIntroComplete,
      })
      timeline.to(cameraState, { progress: 1, duration: 4.1, ease: 'power3.inOut' }, 0)
      timeline.to(cameraState, { theta: 0.38, phi: Math.PI / 2.18, radius: mobile ? 6.6 : 5, duration: 2.1, ease: 'sine.inOut' }, 0.8)
      timeline.to(cameraState, { theta: 0.12, phi: Math.PI / 2.05, radius: mobile ? 6.6 : 5.3, duration: 1.2, ease: 'sine.inOut' }, 2.9)
      if (sweep.current) timeline.fromTo(sweep.current.position, { x: -2.5 }, { x: 2.5, duration: 3.5, ease: 'sine.inOut' }, 0.4)
    } else {
      cameraState.progress = 1
      cameraState.theta = 0.12
      cameraState.radius = mobile ? 6.6 : 5.3
      onIntroComplete?.()
    }
    if (visibleRef.current) invalidate()
    return () => timeline?.kill()
  }, [camera, colors, count, invalidate, mobile, reducedMotion, color, onIntroComplete])

  useEffect(() => {
    if (mobile || reducedMotion) return undefined
    const move = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [mobile, reducedMotion])

  useFrame((_, delta) => {
    if (!mesh.current) return
    clock.current += delta
    const progress = cameraRig.current.progress
    const time = clock.current
    for (let i = 0; i < count; i++) {
      const k = i * 3
      const arrival = THREE.MathUtils.clamp((progress - arrivals[i] * 0.48) / (1 - arrivals[i] * 0.48), 0, 1)
      const morph = arrival * arrival * (3 - 2 * arrival)
      const shimmer = Math.sin(time * 1.6 + i * 0.17) * 0.008 * morph
      dummy.position.set(
        THREE.MathUtils.lerp(starts[k], targets[k], morph) + shimmer,
        THREE.MathUtils.lerp(starts[k + 1], targets[k + 1], morph) + shimmer * 0.5,
        THREE.MathUtils.lerp(starts[k + 2], targets[k + 2], morph),
      )
      const size = sizes[i] * (0.82 + 0.18 * Math.sin(time * 1.8 + i * 0.13))
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true

    const cameraState = cameraRig.current
    const theta = cameraState.theta + (reducedMotion ? 0 : pointer.current.x * 0.025)
    const phi = cameraState.phi - (reducedMotion ? 0 : pointer.current.y * 0.018)
    camera.position.set(Math.sin(theta) * Math.sin(phi) * cameraState.radius, Math.cos(phi) * cameraState.radius, Math.cos(theta) * Math.sin(phi) * cameraState.radius)
    camera.lookAt(0, 0, 0)
  })

  return (
    <group position={[0, 0.45, -0.4]} rotation={[0.03, 0, -0.035]}>
      <pointLight ref={sweep} position={[-2.5, 0.25, 1.4]} color="#F2F2F2" intensity={5} distance={4} decay={2} />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 7, 6]} />
        <meshStandardMaterial color="#ffffff" metalness={0.68} roughness={0.28} emissive="#141414" emissiveIntensity={0.18} />
      </instancedMesh>
    </group>
  )
}

export default function Hero3D({ onReady, onIntroComplete, onError }) {
  const [visible, setVisible] = useState(true)
  const [webglAvailable] = useState(() => hasWebGL())
  const host = useRef(null)
  const interaction = useRef({ x: 0, z: 0, last: -100 })
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700
  const fallback = <div className="hero__fallback" aria-hidden="true" />

  useEffect(() => {
    const node = host.current?.parentElement
    if (!node || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (webglAvailable) return undefined
    onReady?.()
    onIntroComplete?.()
    return undefined
  }, [onIntroComplete, onReady, webglAvailable])

  if (!webglAvailable) return fallback
  return (
    <div className="hero__canvas" ref={host}>
      <Boundary fallback={fallback} onError={onError}>
        <Canvas onCreated={() => onReady?.()} frameloop={visible && !reducedMotion ? 'always' : 'demand'} dpr={mobile ? 1 : [1, 1.35]} camera={{ position: [0, 0, mobile ? 6.6 : 5.55], fov: mobile ? 44 : 38 }} gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}>
          <color attach="background" args={['#090909']} />
          <ambientLight intensity={0.62} />
          <directionalLight position={[3, 4, 5]} intensity={2.4} color="#FFFFFF" />
          <pointLight position={[-3, 1, 2]} intensity={7} color="#D9D9D9" />
          <pointLight position={[3, 1, -3]} intensity={4} color="#AFAFAF" />
          <MountainRange seed={19} z={-7.6} color="#171717" />
          <MountainRange seed={73} z={-6.8} color="#222222" />
          <Lake interaction={interaction} reducedMotion={reducedMotion} />
          <DriftParticles interaction={interaction} mobile={mobile} reducedMotion={reducedMotion} />
          <ParticleA mobile={mobile} reducedMotion={reducedMotion} visible={visible} onIntroComplete={onIntroComplete} />
          <PointerInteraction interaction={interaction} visible={visible} reducedMotion={reducedMotion} />
        </Canvas>
      </Boundary>
    </div>
  )
}
