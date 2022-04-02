import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Clock } from 'three'
import { FlakesTexture } from './FlakesTexture'
import { RGBELoader } from './RGBELoader'

//window sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/** Camera */
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 500)
scene.add(camera)

/** Renderer */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, //видимые/невидымые зоны
  antialias: true //сглаживание
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //ограничение кол-ва рендеров в завис-ти от плотности пикселей

renderer.outputEncoding = THREE.sRGBEncoding //тип яркости
renderer.toneMapping = THREE.ACESFilmicToneMapping //тоже параметр яркости
renderer.toneMappingExposure = 1.25 //величина яркости

const envMapLoader = new THREE.PMREMGenerator(renderer)

new RGBELoader().load('textures/textures/cayley_interior_4k.hdr', function (hdrmap) {
  const envMap = envMapLoader.fromCubemap(hdrmap)
  const texture = new THREE.CanvasTexture(new FlakesTexture())
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.x = 10
  texture.repeat.y = 6

  const ballMaterial = {
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    roughness: 0.5,
    metalness: 0.9,
    color: 0x8418ca,
    normalMap: texture,
    normalScale: new THREE.Vector2(0.15, 0.15),
    envMap: envMap.texture
  }

  /** Object */
  const geometry = new THREE.SphereBufferGeometry(100, 64, 64)
  const material = new THREE.MeshPhysicalMaterial(ballMaterial)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
})


//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true //плавность вращения камеры

/** Light */
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(200, 200, 200)
scene.add(pointLight)


const clock = new Clock()
const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  //Update controls
  controls.update() //если включён Damping для камеры необходимо её обновлять в каждом кадре

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()
