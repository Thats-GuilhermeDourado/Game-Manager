import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  query, 
  doc, 
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Character } from "../contexts/CharacterContext";
import { calculateModifier } from "../data/rules";
import { X, Trash2, User, RotateCcw, Dices, Loader2, Plus, Shield, Zap, Brain, Heart, Star, Sword, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { useSound } from "../hooks/useSound";

interface DiceTrayProps {
  campaignId: string;
  userId: string;
  character?: Character;
  onClose: () => void;
  initialDc?: number;
  initialAttr?: string;
  onRollComplete?: (result: number) => void;
}

interface ActiveRoll {
  id: string;
  userId: string;
  characterName: string;
  characterAvatar?: string;
  dieType: string;
  result: number;
  status: string;
  timestamp: any;
  expiresAt: number;
}

// Geometries for dice with precise result mapping based on face normals
const DICE_GEOMETRIES: Record<string, { 
  type: string,
  getGeometry: () => THREE.BufferGeometry,
  getShape: () => CANNON.Shape,
  resultMapping: (mesh: THREE.Mesh) => number 
}> = {
  d4: {
    type: 'd4',
    getGeometry: () => new THREE.TetrahedronGeometry(1.5),
    getShape: () => {
      const g = new THREE.TetrahedronGeometry(1.5);
      const vertices = Array.from(g.attributes.position.array) as number[];
      const indices = Array.from(g.index?.array || []) as number[];
      return new CANNON.ConvexPolyhedron({
        vertices: vertices.reduce((acc: CANNON.Vec3[], _, i) => {
          if (i % 3 === 0) acc.push(new CANNON.Vec3(vertices[i], vertices[i+1], vertices[i+2]));
          return acc;
        }, []),
        faces: indices.reduce((acc: number[][], _, i) => {
          if (i % 3 === 0) acc.push([indices[i], indices[i+1], indices[i+2]]);
          return acc;
        }, [])
      });
    },
    resultMapping: (mesh) => {
      const normals = [
        new THREE.Vector3(1, 1, 1).normalize(),
        new THREE.Vector3(1, -1, -1).normalize(),
        new THREE.Vector3(-1, 1, -1).normalize(),
        new THREE.Vector3(-1, -1, 1).normalize()
      ];
      const results = [1, 2, 3, 4];
      let maxDot = -Infinity;
      let result = 1;
      normals.forEach((n, i) => {
        const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxDot) {
          maxDot = worldNormal.y;
          result = results[i];
        }
      });
      return result;
    }
  },
  d6: {
    type: 'd6',
    getGeometry: () => new THREE.BoxGeometry(1.5, 1.5, 1.5),
    getShape: () => new CANNON.Box(new CANNON.Vec3(0.75, 0.75, 0.75)),
    resultMapping: (mesh) => {
      const normals = [
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
      ];
      const results = [4, 3, 1, 6, 2, 5];
      let maxDot = -Infinity;
      let result = 1;
      normals.forEach((n, i) => {
        const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxDot) {
          maxDot = worldNormal.y;
          result = results[i];
        }
      });
      return result;
    }
  },
  d8: {
    type: 'd8',
    getGeometry: () => new THREE.OctahedronGeometry(1.5),
    getShape: () => {
      const g = new THREE.OctahedronGeometry(1.5);
      const vertices = Array.from(g.attributes.position.array) as number[];
      const indices = Array.from(g.index?.array || []) as number[];
      return new CANNON.ConvexPolyhedron({
        vertices: vertices.reduce((acc: CANNON.Vec3[], _, i) => {
          if (i % 3 === 0) acc.push(new CANNON.Vec3(vertices[i], vertices[i+1], vertices[i+2]));
          return acc;
        }, []),
        faces: indices.reduce((acc: number[][], _, i) => {
          if (i % 3 === 0) acc.push([indices[i], indices[i+1], indices[i+2]]);
          return acc;
        }, [])
      });
    },
    resultMapping: (mesh) => {
      const normals = [
        new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(1, 1, -1).normalize(),
        new THREE.Vector3(1, -1, 1).normalize(), new THREE.Vector3(1, -1, -1).normalize(),
        new THREE.Vector3(-1, 1, 1).normalize(), new THREE.Vector3(-1, 1, -1).normalize(),
        new THREE.Vector3(-1, -1, 1).normalize(), new THREE.Vector3(-1, -1, -1).normalize()
      ];
      const results = [1, 2, 3, 4, 5, 6, 7, 8];
      let maxDot = -Infinity;
      let result = 1;
      normals.forEach((n, i) => {
        const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxDot) {
          maxDot = worldNormal.y;
          result = results[i];
        }
      });
      return result;
    }
  },
  d10: {
    type: 'd10',
    getGeometry: () => new THREE.IcosahedronGeometry(1.5, 0),
    getShape: () => new CANNON.Sphere(1.5),
    resultMapping: (mesh) => {
      // Improved d10 mapping logic
      const normals = [
        new THREE.Vector3(0, 1, 0).normalize(), new THREE.Vector3(0, -1, 0).normalize(),
        new THREE.Vector3(1, 0.5, 0).normalize(), new THREE.Vector3(-1, 0.5, 0).normalize(),
        new THREE.Vector3(0.5, 0.5, 1).normalize(), new THREE.Vector3(0.5, 0.5, -1).normalize(),
        new THREE.Vector3(-0.5, -0.5, 1).normalize(), new THREE.Vector3(-0.5, -0.5, -1).normalize(),
        new THREE.Vector3(1, -0.5, 0.5).normalize(), new THREE.Vector3(-1, -0.5, -0.5).normalize()
      ];
      const results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let maxDot = -Infinity;
      let result = 1;
      normals.forEach((n, i) => {
        const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxDot) {
          maxDot = worldNormal.y;
          result = results[i];
        }
      });
      return result;
    }
  },
  d12: {
    type: 'd12',
    getGeometry: () => new THREE.DodecahedronGeometry(1.5),
    getShape: () => {
      const g = new THREE.DodecahedronGeometry(1.5);
      const vertices = Array.from(g.attributes.position.array) as number[];
      const indices = Array.from(g.index?.array || []) as number[];
      return new CANNON.ConvexPolyhedron({
        vertices: vertices.reduce((acc: CANNON.Vec3[], _, i) => {
          if (i % 3 === 0) acc.push(new CANNON.Vec3(vertices[i], vertices[i+1], vertices[i+2]));
          return acc;
        }, []),
        faces: indices.reduce((acc: number[][], _, i) => {
          if (i % 3 === 0) acc.push([indices[i], indices[i+1], indices[i+2]]);
          return acc;
        }, [])
      });
    },
    resultMapping: (mesh) => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const normals = [
        new THREE.Vector3(0, 1/phi, phi).normalize(), new THREE.Vector3(0, 1/phi, -phi).normalize(),
        new THREE.Vector3(0, -1/phi, phi).normalize(), new THREE.Vector3(0, -1/phi, -phi).normalize(),
        new THREE.Vector3(phi, 0, 1/phi).normalize(), new THREE.Vector3(phi, 0, -1/phi).normalize(),
        new THREE.Vector3(-phi, 0, 1/phi).normalize(), new THREE.Vector3(-phi, 0, -1/phi).normalize(),
        new THREE.Vector3(1/phi, phi, 0).normalize(), new THREE.Vector3(1/phi, -phi, 0).normalize(),
        new THREE.Vector3(-1/phi, phi, 0).normalize(), new THREE.Vector3(-1/phi, -phi, 0).normalize()
      ];
      const results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      let maxDot = -Infinity;
      let result = 1;
      normals.forEach((n, i) => {
        const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxDot) {
          maxDot = worldNormal.y;
          result = results[i];
        }
      });
      return result;
    }
  },
  d20: {
    type: 'd20',
    getGeometry: () => new THREE.IcosahedronGeometry(1.5),
    getShape: () => {
      const g = new THREE.IcosahedronGeometry(1.5);
      const vertices = Array.from(g.attributes.position.array) as number[];
      const indices = Array.from(g.index?.array || []) as number[];
      return new CANNON.ConvexPolyhedron({
        vertices: vertices.reduce((acc: CANNON.Vec3[], _, i) => {
          if (i % 3 === 0) acc.push(new CANNON.Vec3(vertices[i], vertices[i+1], vertices[i+2]));
          return acc;
        }, []),
        faces: indices.reduce((acc: number[][], _, i) => {
          if (i % 3 === 0) acc.push([indices[i], indices[i+1], indices[i+2]]);
          return acc;
        }, [])
      });
    },
    resultMapping: (mesh) => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const normals = [
        new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(1, 1, -1).normalize(),
        new THREE.Vector3(1, -1, 1).normalize(), new THREE.Vector3(1, -1, -1).normalize(),
        new THREE.Vector3(-1, 1, 1).normalize(), new THREE.Vector3(-1, 1, -1).normalize(),
        new THREE.Vector3(-1, -1, 1).normalize(), new THREE.Vector3(-1, -1, -1).normalize(),
        new THREE.Vector3(0, 1/phi, phi).normalize(), new THREE.Vector3(0, 1/phi, -phi).normalize(),
        new THREE.Vector3(0, -1/phi, phi).normalize(), new THREE.Vector3(0, -1/phi, -phi).normalize(),
        new THREE.Vector3(phi, 0, 1/phi).normalize(), new THREE.Vector3(phi, 0, -1/phi).normalize(),
        new THREE.Vector3(-phi, 0, 1/phi).normalize(), new THREE.Vector3(-phi, 0, -1/phi).normalize(),
        new THREE.Vector3(1/phi, phi, 0).normalize(), new THREE.Vector3(1/phi, -phi, 0).normalize(),
        new THREE.Vector3(-1/phi, phi, 0).normalize(), new THREE.Vector3(-1/phi, -phi, 0).normalize()
      ];
      const results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      let maxDot = -Infinity;
      let result = 1;
      normals.forEach((n, i) => {
        const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxDot) {
          maxDot = worldNormal.y;
          result = results[i];
        }
      });
      return result;
    }
  }
};

export const DiceTray: React.FC<DiceTrayProps> = ({ 
  campaignId, 
  userId, 
  character,
  onClose,
  initialDc = 10,
  initialAttr,
  onRollComplete
}) => {
  const { playSound } = useSound();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRolls, setActiveRolls] = useState<ActiveRoll[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [selectedDie, setSelectedDie] = useState<string>('d20');
  const [isRolling, setIsRolling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [isCriticalHit, setIsCriticalHit] = useState(false);
  const [isCriticalFail, setIsCriticalFail] = useState(false);
  
  // DC and Modifiers State
  const [dc, setDc] = useState(initialDc);
  const [selectedAttr, setSelectedAttr] = useState<string | null>(initialAttr || null);
  const [useProficiency, setUseProficiency] = useState(false);
  const [useExpertise, setUseExpertise] = useState(false);
  const [rollMode, setRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [customBonus, setCustomBonus] = useState(0);
  
  // Refs for state to avoid stale closures in animate loop
  const dcRef = useRef(dc);
  const selectedAttrRef = useRef(selectedAttr);
  const useProficiencyRef = useRef(useProficiency);
  const useExpertiseRef = useRef(useExpertise);
  const customBonusRef = useRef(customBonus);
  const rollModeRef = useRef(rollMode);

  useEffect(() => { dcRef.current = dc; }, [dc]);
  useEffect(() => { selectedAttrRef.current = selectedAttr; }, [selectedAttr]);
  useEffect(() => { useProficiencyRef.current = useProficiency; }, [useProficiency]);
  useEffect(() => { useExpertiseRef.current = useExpertise; }, [useExpertise]);
  useEffect(() => { customBonusRef.current = customBonus; }, [customBonus]);
  useEffect(() => { rollModeRef.current = rollMode; }, [rollMode]);
  
  // Results for advantage/disadvantage
  const [rollResults, setRollResults] = useState<number[]>([]);

  // Physics state refs
  const isRollingRef = useRef(false);
  const hasSavedThisRollRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Three.js & Cannon.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const dieMeshRef = useRef<THREE.Mesh | null>(null);
  const dieBodyRef = useRef<CANNON.Body | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const requestRef = useRef<number | null>(null);

  // Sincronização em tempo real
  useEffect(() => {
    const q = query(
      collection(db, `campaigns/${campaignId}/activeRolls`),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rolls = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          expiresAt: data.expiresAt || (Date.now() + 30000)
        } as ActiveRoll;
      });
      setActiveRolls(rolls);
    });

    return () => unsubscribe();
  }, [campaignId]);

  // Auto-cleanup for expired rolls
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeRolls.forEach(async (roll) => {
        if (roll.expiresAt < now) {
          try {
            const rollDoc = doc(db, `campaigns/${campaignId}/activeRolls/${roll.id}`);
            await deleteDoc(rollDoc);
          } catch (error) {
            // Ignore
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRolls, campaignId]);

  const saveRollToFirestore = async (type: string, value: number) => {
    if (value <= 0) return;
    
    try {
      await addDoc(collection(db, `campaigns/${campaignId}/activeRolls`), {
        userId,
        characterName: character?.name || "Dungeon Master",
        characterAvatar: character?.appearance || "",
        dieType: type,
        result: value,
        status: "landed",
        timestamp: serverTimestamp(),
        expiresAt: Date.now() + 30000 // 30 seconds life
      });
    } catch (error) {
      console.error("Error saving roll:", error);
    }
  };

  // Initialize 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    hasSavedThisRollRef.current = false;
    isRollingRef.current = false;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Get initial dimensions
    const rect = containerRef.current.getBoundingClientRect();
    let width = rect.width || 1;
    let height = rect.height || 1;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Handle resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !isMounted) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth === 0 || newHeight === 0) return;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(containerRef.current);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);
    
    const spotLight = new THREE.SpotLight(0xD4AF37, 2);
    spotLight.position.set(-10, 20, -10);
    scene.add(spotLight);

    // Physics setup
    const world = new CANNON.World();
    world.gravity.set(0, -40, 0);
    world.allowSleep = true;
    worldRef.current = world;

    // Floor & Walls
    const createPlane = (pos: CANNON.Vec3, rot: { x: number, y: number, z: number }) => {
      const body = new CANNON.Body({ mass: 0 });
      body.addShape(new CANNON.Plane());
      body.position.copy(pos);
      body.quaternion.setFromEuler(rot.x, rot.y, rot.z);
      world.addBody(body);
    };
    createPlane(new CANNON.Vec3(0, 0, 0), { x: -Math.PI / 2, y: 0, z: 0 }); // Floor
    createPlane(new CANNON.Vec3(0, 0, -10), { x: 0, y: 0, z: 0 }); // Back
    createPlane(new CANNON.Vec3(0, 0, 10), { x: 0, y: Math.PI, z: 0 }); // Front
    createPlane(new CANNON.Vec3(-15, 0, 0), { x: 0, y: Math.PI / 2, z: 0 }); // Left
    createPlane(new CANNON.Vec3(15, 0, 0), { x: 0, y: -Math.PI / 2, z: 0 }); // Right

    // Die setup
    const dieConfig = DICE_GEOMETRIES[selectedDie];
    const geometry = dieConfig.getGeometry();
    const material = new THREE.MeshStandardMaterial({ 
      color: '#2a2a3a', 
      roughness: 0.1, 
      metalness: 0.9,
      flatShading: true,
      emissive: '#1a1a2a',
      emissiveIntensity: 0.1
    });
    
    const dieMesh = new THREE.Mesh(geometry, material);
    dieMesh.position.set(0, 6, 0);
    dieMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(dieMesh);
    dieMeshRef.current = dieMesh;

    const dieShape = dieConfig.getShape();
    const dieBody = new CANNON.Body({ 
      mass: 1.2, 
      shape: dieShape,
      position: new CANNON.Vec3(0, 6, 0),
      angularDamping: 0.2,
      linearDamping: 0.1
    });
    dieBody.quaternion.copy(dieMesh.quaternion as any);
    world.addBody(dieBody);
    dieBodyRef.current = dieBody;

    // Animation loop
    const animate = () => {
      if (!isMounted) return;

      if (!isDraggingRef.current) {
        world.step(1 / 60);
        dieMesh.position.copy(dieBody.position as any);
        dieMesh.quaternion.copy(dieBody.quaternion as any);
      } else {
        dieMesh.position.y = 6;
        dieBody.position.copy(dieMesh.position as any);
        dieBody.quaternion.copy(dieMesh.quaternion as any);
        dieBody.velocity.set(0, 0, 0);
        dieBody.angularVelocity.set(0, 0, 0);
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);

      // Result detection
      if (!isDraggingRef.current && isRollingRef.current && !hasSavedThisRollRef.current) {
        const vel = dieBody.velocity.length();
        const angVel = dieBody.angularVelocity.length();
        
        if (vel < 0.15 && angVel < 0.15 && dieBody.position.y < 3) {
          setTimeout(() => {
            if (!isMounted || hasSavedThisRollRef.current) return;
            
            const finalVel = dieBody.velocity.length();
            if (finalVel < 0.15) {
              hasSavedThisRollRef.current = true;
              const result = dieConfig.resultMapping(dieMesh);
              
              // Handle Advantage/Disadvantage logic
              if (rollModeRef.current !== 'normal' && selectedDie === 'd20') {
                setRollResults(prev => {
                  const newResults = [...prev, result];
                  if (newResults.length === 2) {
                    const finalResult = rollModeRef.current === 'advantage' 
                      ? Math.max(...newResults) 
                      : Math.min(...newResults);
                    
                    setCurrentResult(finalResult);
                    
                    // Critical checks
                    if (finalResult === 20) setIsCriticalHit(true);
                    if (finalResult === 1) setIsCriticalFail(true);

                    // Calculate total with modifiers
                    const totalBonus = getTotalBonus();
                    const finalTotal = finalResult + totalBonus;
                    saveRollToFirestore(selectedDie, finalTotal);
                    
                    if (onRollComplete) {
                      onRollComplete(finalTotal);
                    }

                    if (finalTotal >= dcRef.current || finalResult === 20) {
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 3000);
                    } else {
                      setShowFailure(true);
                      setTimeout(() => setShowFailure(false), 3000);
                    }
                    
                    setIsRolling(false);
                    isRollingRef.current = false;
                    return newResults;
                  } else {
                    // Roll second die automatically
                    setTimeout(() => {
                      hasSavedThisRollRef.current = false;
                      isRollingRef.current = true;
                      dieBody.wakeUp();
                      dieBody.position.set(0, 6, 0);
                      dieBody.velocity.set((Math.random() - 0.5) * 60, -40, (Math.random() - 0.5) * 60);
                      dieBody.angularVelocity.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
                    }, 500);
                    return newResults;
                  }
                });
              } else {
                setCurrentResult(result);
                
                // Critical checks
                if (selectedDie === 'd20') {
                  if (result === 20) setIsCriticalHit(true);
                  if (result === 1) setIsCriticalFail(true);
                }

                // Calculate total with modifiers
                const totalBonus = getTotalBonus();
                const finalTotal = result + totalBonus;
                saveRollToFirestore(selectedDie, finalTotal);
                
                if (onRollComplete) {
                  onRollComplete(finalTotal);
                }

                if (finalTotal >= dcRef.current || (selectedDie === 'd20' && result === 20)) {
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                } else {
                  setShowFailure(true);
                  setTimeout(() => setShowFailure(false), 3000);
                }
                
                setIsRolling(false);
                isRollingRef.current = false;
              }
            }
          }, 200);
        }
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    setIsInitialized(true);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [selectedDie]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    hasSavedThisRollRef.current = false;
    isRollingRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
    setCurrentResult(null);
    setIsCriticalHit(false);
    setIsCriticalFail(false);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !dieMeshRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - lastMousePos.current.x;
    const dy = clientY - lastMousePos.current.y;

    dieMeshRef.current.rotation.x += dy * 0.02;
    dieMeshRef.current.rotation.y += dx * 0.02;

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current || !dieBodyRef.current) return;
    isDraggingRef.current = false;
    isRollingRef.current = true;
    setIsRolling(true);
    setShowSuccess(false);
    setShowFailure(false);
    setRollResults([]);
    
    const forceX = (Math.random() - 0.5) * 60;
    const forceZ = (Math.random() - 0.5) * 60;
    const forceY = -40; 

    dieBodyRef.current.wakeUp();
    dieBodyRef.current.velocity.set(forceX, forceY, forceZ);
    dieBodyRef.current.angularVelocity.set(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );
    playSound('dice');
  };

  const resetDie = () => {
    if (!dieBodyRef.current || !dieMeshRef.current) return;
    dieBodyRef.current.wakeUp();
    dieBodyRef.current.position.set(0, 6, 0);
    dieBodyRef.current.velocity.set(0, 0, 0);
    dieBodyRef.current.angularVelocity.set(0, 0, 0);
    dieMeshRef.current.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    setCurrentResult(null);
    setRollResults([]);
    hasSavedThisRollRef.current = false;
    isRollingRef.current = false;
    setIsRolling(false);
    setShowSuccess(false);
    setShowFailure(false);
    setIsCriticalHit(false);
    setIsCriticalFail(false);
  };

  const rollDice = () => {
    if (isRolling || !dieBodyRef.current) return;
    
    resetDie();
    setTimeout(() => {
      isRollingRef.current = true;
      setIsRolling(true);
      setShowSuccess(false);
      setShowFailure(false);
      setRollResults([]);
      
      const forceX = (Math.random() - 0.5) * 60;
      const forceZ = (Math.random() - 0.5) * 60;
      const forceY = -40; 

      dieBodyRef.current!.wakeUp();
      dieBodyRef.current!.velocity.set(forceX, forceY, forceZ);
      dieBodyRef.current!.angularVelocity.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      playSound('dice');
    }, 100);
  };

  const getProficiencyBonus = () => {
    if (!character) return 0;
    const prof = Math.floor((character.level - 1) / 4) + 2;
    return useExpertiseRef.current ? prof * 2 : prof;
  };

  const getTotalBonus = () => {
    let total = customBonusRef.current;
    if (selectedAttrRef.current && character) {
      total += calculateModifier(character.attributes[selectedAttrRef.current]);
    }
    if (useProficiencyRef.current) {
      total += getProficiencyBonus();
    }
    return total;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
      <div className="relative w-full max-w-6xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-row h-[90vh] bg-[#050505] border border-white/5 rounded-[2.5rem]">
        {/* Left Sidebar - Modifiers (BG3 Style) */}
        <div className="w-72 border-r border-white/5 bg-white/2 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-gold" />
              <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Attributes</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(attr => (
                <button
                  key={attr}
                  onClick={() => setSelectedAttr(selectedAttr === attr ? null : attr)}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1 group",
                    selectedAttr === attr 
                      ? "bg-gold/20 border-gold/40 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                      : "bg-white/5 border-white/5 text-parchment/40 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-gold transition-colors">{attr}</span>
                  <span className="text-lg font-bold font-display">
                    {character ? (calculateModifier(character.attributes[attr]) >= 0 ? `+${calculateModifier(character.attributes[attr])}` : calculateModifier(character.attributes[attr])) : '+0'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-gold" />
              <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Proficiency</h3>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setUseProficiency(!useProficiency);
                  if (useProficiency) setUseExpertise(false);
                }}
                className={cn(
                  "w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                  useProficiency 
                    ? "bg-gold/20 border-gold/40 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                    : "bg-white/5 border-white/5 text-parchment/40 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest">Trained</span>
                  <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest mt-0.5">Basic Bonus</span>
                </div>
                <span className="text-xl font-bold font-display">+{character ? Math.floor((character.level - 1) / 4) + 2 : 2}</span>
              </button>
              
              {useProficiency && (
                <button
                  onClick={() => setUseExpertise(!useExpertise)}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                    useExpertise 
                      ? "bg-gold/20 border-gold/40 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                      : "bg-white/5 border-white/5 text-parchment/40 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest">Expertise</span>
                    <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest mt-0.5">Double Bonus</span>
                  </div>
                  <Sparkles size={18} className={useExpertise ? "text-gold" : "text-white/10"} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sword size={14} className="text-gold" />
              <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Custom Bonus</h3>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <button 
                onClick={() => setCustomBonus(prev => prev - 1)}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-parchment/40 hover:bg-white/10 hover:text-gold transition-all"
              >-</button>
              <div className="flex-1 text-center">
                <span className="text-xl font-bold text-parchment font-display">{customBonus >= 0 ? `+${customBonus}` : customBonus}</span>
                <p className="text-[8px] font-black text-parchment/20 uppercase tracking-widest mt-0.5">Buffs</p>
              </div>
              <button 
                onClick={() => setCustomBonus(prev => prev + 1)}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-parchment/40 hover:bg-white/10 hover:text-gold transition-all"
              >+</button>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col relative bg-gradient-to-b from-midnight to-black overflow-hidden">
          {/* BG3 Ornate Border Decoration */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent z-50" style={{ 
            borderImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png") 30 round',
            opacity: 0.05
          }} />
          
          {/* Ornate Corners */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-gold/30 rounded-tl-[2.5rem] pointer-events-none z-50" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-gold/30 rounded-tr-[2.5rem] pointer-events-none z-50" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-gold/30 rounded-bl-[2.5rem] pointer-events-none z-50" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-gold/30 rounded-br-[2.5rem] pointer-events-none z-50" />
          
          {/* Header - DC Display */}
          <div className="relative flex flex-col items-center pt-8 pb-4 px-12">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            
            <div className="text-center space-y-1">
              <h2 className="text-[10px] font-black text-gold/60 uppercase tracking-[0.6em]">Difficulty Class</h2>
              <div className="flex items-center gap-8">
                <button onClick={() => setDc(prev => Math.max(1, prev - 1))} className="text-gold/20 hover:text-gold transition-all hover:scale-125"><ChevronDown size={32} /></button>
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full animate-pulse" />
                  <div className="relative text-6xl font-display font-black text-parchment drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                    {dc}
                  </div>
                </div>
                <button onClick={() => setDc(prev => prev + 1)} className="text-gold/20 hover:text-gold transition-all hover:scale-125"><ChevronUp size={32} /></button>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-6" />
          </div>

          {/* Dice Area */}
          <div 
            className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden min-h-[200px]" 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Success/Failure Overlays */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[100] flex items-center justify-center bg-emerald-500/10 pointer-events-none"
                >
                  <div className="relative flex flex-col items-center">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "140%", opacity: 1 }}
                      className="h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mb-8"
                    />
                    <div className="relative">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className={cn(
                          "text-8xl font-display font-black uppercase tracking-[0.3em] drop-shadow-[0_0_50px_rgba(52,211,153,0.8)]",
                          isCriticalHit ? "text-gold" : "text-emerald-400"
                        )}
                      >
                        {isCriticalHit ? "Critical Success" : "Success"}
                      </motion.div>
                      {isCriticalHit && (
                        <motion.div 
                          animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-gold/20 blur-3xl rounded-full -z-10"
                        />
                      )}
                    </div>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-emerald-400/60 text-xs font-black uppercase tracking-[1em] mt-8"
                    >
                      {isCriticalHit ? "The gods themselves applaud" : "The fates favor you"}
                    </motion.div>
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "140%", opacity: 1 }}
                      className="h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mt-8"
                    />
                  </div>
                </motion.div>
              )}
              {showFailure && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[100] flex items-center justify-center bg-red-500/10 pointer-events-none"
                >
                  <div className="relative flex flex-col items-center">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "140%", opacity: 1 }}
                      className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mb-8"
                    />
                    <div className="relative">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className={cn(
                          "text-8xl font-display font-black uppercase tracking-[0.3em] drop-shadow-[0_0_50px_rgba(248,113,113,0.8)]",
                          isCriticalFail ? "text-red-600" : "text-red-400"
                        )}
                      >
                        {isCriticalFail ? "Critical Failure" : "Failure"}
                      </motion.div>
                      {isCriticalFail && (
                        <motion.div 
                          animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-red-900/40 blur-3xl rounded-full -z-10"
                        />
                      )}
                    </div>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-red-400/60 text-xs font-black uppercase tracking-[1em] mt-8"
                    >
                      {isCriticalFail ? "A dark omen falls upon you" : "Fortune turns away"}
                    </motion.div>
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "140%", opacity: 1 }}
                      className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mt-8"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isInitialized && (
              <div className="absolute inset-0 flex items-center justify-center bg-midnight/50 backdrop-blur-sm z-[110]">
                <Loader2 className="w-16 h-16 text-gold animate-spin" />
              </div>
            )}

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[120]">
              <AnimatePresence>
                {currentResult !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="relative flex flex-col items-center"
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-[100px] animate-pulse" />
                    <div className={cn(
                      "relative text-8xl font-black font-display tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]",
                      isCriticalHit ? "text-gold" : isCriticalFail ? "text-red-500" : "text-parchment"
                    )}>
                      {currentResult}
                    </div>
                    
                    {/* Modifier Breakdown */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-col items-center gap-1"
                    >
                      <div className="flex items-center gap-2 text-parchment/40 text-xs font-black uppercase tracking-widest">
                        <span>Roll {currentResult}</span>
                        {getTotalBonus() !== 0 && (
                          <>
                            <span>+</span>
                            <span>Bonus {getTotalBonus()}</span>
                          </>
                        )}
                      </div>
                      <div className="px-8 py-3 bg-gold text-midnight rounded-full font-black text-2xl shadow-[0_10px_40px_rgba(212,175,55,0.4)] border-4 border-white/20">
                        Total: {currentResult + getTotalBonus()}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Roll Results for Adv/Dis */}
            {rollResults.length > 0 && rollMode !== 'normal' && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                {rollResults.map((res, i) => (
                  <div key={i} className={cn(
                    "w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-lg font-display transition-all duration-500",
                    currentResult === res 
                      ? "bg-gold/20 border-gold text-gold scale-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                      : "bg-white/5 border-white/10 text-parchment/20"
                  )}>
                    {res}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Roll Button & Modes */}
          <div className="relative p-6 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex items-center gap-4">
              {(['normal', 'advantage', 'disadvantage'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setRollMode(mode)}
                  className={cn(
                    "px-6 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                    rollMode === mode 
                      ? "bg-gold text-midnight border-gold shadow-lg" 
                      : "bg-white/5 border-white/10 text-parchment/30 hover:text-parchment hover:bg-white/10"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button 
              onClick={rollDice}
              disabled={isRolling}
              className="group relative px-16 py-6 bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/15 border border-white/20 rounded-[2rem] transition-all duration-500 disabled:opacity-50 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] blur-2xl" />
              <div className="relative flex items-center gap-4">
                <Zap size={24} className="text-gold group-hover:rotate-12 transition-transform duration-500" />
                <span className="text-2xl font-display font-black text-parchment uppercase tracking-[0.4em] group-hover:text-gold transition-colors drop-shadow-2xl">
                  {isRolling ? "Rolling..." : "Roll Dice"}
                </span>
              </div>
            </button>

            <button 
              onClick={onClose}
              className="text-[9px] font-black text-parchment/20 uppercase tracking-[0.6em] hover:text-parchment/60 transition-all hover:tracking-[0.8em]"
            >
              Cancel Roll
            </button>
          </div>
        </div>

        {/* Right Sidebar - History (BG3 Style) */}
        <div className="w-64 border-l border-white/5 bg-white/2 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
            <RotateCcw size={14} className="text-gold" />
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">History</h3>
          </div>
          <div className="flex flex-col gap-4">
            {activeRolls.map(roll => (
              <div key={roll.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 group hover:border-gold/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-[8px] font-black text-gold">
                    {roll.characterName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-parchment/60 truncate block uppercase tracking-tight">{roll.characterName}</span>
                    <span className="text-[7px] text-parchment/20 font-black uppercase tracking-widest">d{roll.dieType}</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-gold font-display group-hover:scale-110 transition-transform origin-left">{roll.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
