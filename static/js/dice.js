import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class DiceAnimation {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.dice = null;
        this.isRolling = false;

        this.init();
    }

    init() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        this.scene.add(directionalLight);

        this.createDice();

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    createDice() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.dice = new THREE.Mesh(geometry, material);
        this.scene.add(this.dice);
        this.render();
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    render() {
        requestAnimationFrame(() => this.render());
        if (this.dice && this.isRolling) {
            this.dice.rotation.x += 0.1;
            this.dice.rotation.y += 0.1;
            this.dice.rotation.z += 0.1;
        }
        this.renderer.render(this.scene, this.camera);
    }

    rollDice() {
        return new Promise((resolve) => {
            this.isRolling = true;
            setTimeout(() => {
                this.isRolling = false;
                resolve();
            }, 2000);
        });
    }
}
