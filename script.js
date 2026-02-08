// Initialize 3D Scene
let scene, camera, renderer, cube;

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(document.getElementById('3d-container').offsetWidth, 
                     document.getElementById('3d-container').offsetHeight);
    document.getElementById('3d-container').appendChild(renderer.domElement);

    // Add 3D object
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        shininess: 100 
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0x404040);
    scene.add(light2);

    camera.position.z = 5;

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize 3D Map
function initMap() {
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
    
    const map = new mapboxgl.Map({
        container: '3d-map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [77.2090, 28.6139], // Delhi
        zoom: 11,
        pitch: 60,
        bearing: -17.6,
        antialias: true
    });

    // Add 3D terrain
    map.on('load', () => {
        map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
        });
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        // Add 3D buildings
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    15.05, ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    15.05, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        });

        // Add click event for location selection
        map.on('click', (e) => {
            const coordinates = e.lngLat;
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`<h3>📍 यहाँ सर्विस चाहिए?</h3>
                         <button onclick="selectLocation([${coordinates.lng}, ${coordinates.lat}])">
                         ✅ इस लोकेशन को सेलेक्ट करें</button>`)
                .addTo(map);
        });
    });
}

// WhatsApp Functions
function openWhatsApp() {
    const phone = "91YOUR_NUMBER";
    const problem = document.querySelector('.problem-btn.active')?.dataset.problem || "सेवा जानकारी";
    const location = document.getElementById('location').value || "लोकेशन नहीं डाली";
    
    const message = `नमस्ते! मुझे 3D सर्विस चाहिए:
    
🔧 समस्या: ${problem}
📍 लोकेशन: ${location}
📞 कॉलबैक: ___________
⏰ समय: जल्द से जल्द

कृपया 3D विज़ुअलाइजेशन भेजें!`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function sendQuickMsg() {
    const msg = document.getElementById('quick-msg').value;
    if (msg) {
        const phone = "91YOUR_NUMBER";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        document.getElementById('quick-msg').value = "";
    }
}

function toggleWhatsApp() {
    const tooltip = document.querySelector('.whatsapp-tooltip');
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
}

// Problem Selection
document.querySelectorAll('.problem-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.problem-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Change 3D model based on problem
        change3DModel(this.dataset.problem);
    });
});

function change3DModel(problem) {
    // This would change the 3D model based on service type
    const colors = {
        'मोबाइल रिपेयर': 0x00ff88,
        'AC सर्विस': 0x0088ff,
        'प्लंबिंग': 0xff8800,
        'इलेक्ट्रिकल': 0xff0088,
        'अन्य': 0x8800ff
    };
    
    if (cube) {
        cube.material.color.setHex(colors[problem] || 0x00ff88);
    }
}

// Location Functions
function locateOnMap() {
    const location = document.getElementById('location').value;
    if (location) {
        alert(`मैप पर ${location} ढूंढा जा रहा है...`);
        // Here you would geocode the location and center map
    }
}

function selectLocation(coords) {
    document.getElementById('location').value = `लैट: ${coords[1].toFixed(4)}, लॉन्ग: ${coords[0].toFixed(4)}`;
    alert('लोकेशन सेव हो गई! अब व्हाट्सएप्प पर मैसेज करें।');
}

// 3D Product Controls
function rotateModel(direction) {
    if (cube) {
        cube.rotation.y += direction === 'left' ? 0.5 : -0.5;
    }
}

function zoomModel(type) {
    if (camera) {
        camera.position.z += type === 'in' ? -0.5 : 0.5;
    }
}

function explodeModel() {
    // Simple explode effect
    if (cube) {
        cube.scale.set(1.5, 1.5, 1.5);
        setTimeout(() => cube.scale.set(1, 1, 1), 500);
    }
}

// Start Service Process
function startService() {
    const problem = document.querySelector('.problem-btn.active')?.dataset.problem;
    const location = document.getElementById('location').value;
    
    if (!problem || !location) {
        alert('कृपया समस्या और लोकेशन चुनें!');
        return;
    }
    
    // Show 3D visualization
    alert(`🎬 ${problem} का 3D विज़ुअलाइजेशन शुरू हो रहा है...`);
    
    // Auto-open WhatsApp after 3 seconds
    setTimeout(openWhatsApp, 3000);
}

// Initialize everything when page loads
window.onload = function() {
    init3D();
    initMap();
    
    // Add typing effect
    const text = "आपकी समस्या, 3D में समाधान!";
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            document.querySelector('.typing-text').innerHTML = text.substring(0, i+1) + 
                (i < text.length ? '<span class="cursor">|</span>' : '');
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();
};

// Add cursor blink effect
setInterval(() => {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
    }
}, 500);
