import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

// Define the prop types for our FbxModel
interface FbxModelProps {
  url: string;
  scale?: number;
}

function FbxModel({ url, scale = 0.01, ...props }: Readonly<FbxModelProps>) {
  // Load the FBX model using the updated FBXLoader.
  const fbx = useLoader(FBXLoader, url);
  const groupRef = useRef<THREE.Group>(null!);

  // Optionally, auto-rotate the model (uncomment if desired)
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Uncomment the following line to enable auto-rotation:
      // groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {/* Render the loaded FBX model as a primitive */}
      <primitive object={fbx} scale={scale} />
    </group>
  );
}

function FbxViewer() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 2, 5], fov: 50 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* OrbitControls with zoom and rotation enabled */}
      <OrbitControls
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
        enableRotate={true}
      />

      {/* Suspense for lazy-loading the FBX model */}
      <Suspense fallback={null}>
        {/* Ensure your FBX file is placed in the public/models folder */}
        <FbxModel url="/models/drone1.fbx" scale={0.02} />
      </Suspense>
    </Canvas>
  );
}

export default FbxViewer;
