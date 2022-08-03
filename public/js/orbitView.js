import * as THREE from 'three';
import { kepler2xyz, keplerPoints } from '/js/orbit.js';

import { OrbitControls } from 'https://unpkg.com/three@0.143.0/examples/jsm/controls/OrbitControls.js';

export default class OrbitView {
  /**
   * Creates a new instance of OrbitView
   * @param {number} height Height of the canvas
   * @param {number} width Width of the canvas
   * @param {HTMLElement} container Container element which holds the canvas
   */
  constructor(height, width, container) {
    // Setup the renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: false });
    this.renderer.setClearColor(new THREE.Color(0x000000), 1);
    this.renderer.setSize(height, width);

    // Add canvas to the DOM
    let canvas = container.appendChild(this.renderer.domElement);
    canvas.className = "view-three-d";

    // Setup scene
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    this.camera.position.y = 40;

    // Setup orbital controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.update();

    this.addAxes();
  }

  addBody(body, JD) {
    // Create mesh for planet
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const planetMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: body.color }));
    const scale = Math.log(body.diameter / 2) / 200.0;
    const pos = kepler2xyz(body.orbit, JD);
    planetMesh.scale.set(scale, scale, scale);
    planetMesh.position.set(pos.x, pos.y, pos.z);
    this.scene.add(planetMesh);
  }

  addOrbit(body, JD) {
    const points = [];
    for (const p of keplerPoints(body.orbit, JD)) {
      points.push(new THREE.Vector3(p.x, p.y, p.z));
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbit = new THREE.Line(lineGeometry, lineMaterial);

    this.scene.add(orbit);
  }

  /**
   * Adds colored XYZ axes to the scene
   * @param {THREE.Scene} scene The scene to add the axes to
   */
  addAxes() {

    const xPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 0, 0)];
    const xAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(xPoints),
      new THREE.LineBasicMaterial({ color: 0xFF0000 })
    );

    const yPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1000, 0)];
    const yAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(yPoints),
      new THREE.LineBasicMaterial({ color: 0x00FF00 })
    );

    const zPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1000)];
    const zAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(zPoints),
      new THREE.LineBasicMaterial({ color: 0x0000FF })
    );
    
    this.scene.add(xAxis);
    this.scene.add(yAxis);
    this.scene.add(zAxis);
  };

  animate() {
    requestAnimationFrame(() => {this.animate()});
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}