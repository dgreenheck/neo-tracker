import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(new THREE.Color( 0xffffff ), 1);
renderer.setSize(600, 600);

let canvas = document.getElementById("orbit-viewer").appendChild(renderer.domElement);
canvas.className = "view-threed";

const geometry = new THREE.SphereGeometry(1, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
};

animate();

// Need to convert orbital elements into position
// Break orbits into segments and draw each segment
// Do this for all planets