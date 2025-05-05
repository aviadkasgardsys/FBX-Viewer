import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

// Define the prop types for our FBX model component
interface FbxModelProps {
  url: string;
  scale?: number;
}
const allowedKeys: (keyof THREE.MeshStandardMaterialParameters)[] = [
  "color",
  "roughness",
  "metalness",
  "map",
  "lightMap",
  "lightMapIntensity",
  "aoMap",
  "aoMapIntensity",
  "emissive",
  "emissiveIntensity",
  "emissiveMap",
  "bumpMap",
  "bumpScale",
  "normalMap",
  "normalMapType",
  "normalScale",
  "displacementMap",
  "displacementScale",
  "displacementBias",
  "roughnessMap",
  "metalnessMap",
  "alphaMap",
  "envMap",
  "envMapRotation",
  "envMapIntensity",
  "wireframe",
  "wireframeLinewidth",
  "fog",
  "flatShading",
];
function convertToStandardMaterial(
  oldMaterial: THREE.Material
): THREE.Material {
  if (oldMaterial instanceof THREE.MeshPhongMaterial) {
    const parameters: THREE.MeshStandardMaterialParameters = {};

    // Copy allowed keys:
    allowedKeys.forEach((key) => {
      if ((oldMaterial as any)[key] !== undefined) {
        const value = (oldMaterial as any)[key];
        if (value instanceof THREE.Color) {
          parameters[key] = value.clone() as any;
        } else {
          parameters[key] = value;
        }
      }
    });

    // Custom conversion for Phong-only properties:
    // Convert "shininess" to roughness.
    // For instance, assuming a maximum shininess of 100, we do:
    if ((oldMaterial as any).shininess !== undefined) {
      const shininess = (oldMaterial as any).shininess;
      // Clamp the value between 0 and 1.
      parameters.roughness = 1 - Math.min(shininess / 100, 1);
    }
    // Optionally, you can log or use the specular property.
    // For example, you might decide that a high specular value (if not white)
    // indicates a slightly higher metalness, but many artists set metalness to 0 by default.
    if ((oldMaterial as any).specular !== undefined) {
      const specular = (oldMaterial as any).specular;
      console.log("Specular color:", specular.getHexString());
      // In a basic conversion, you might simply set metalness to 0:
      parameters.metalness = 0;
    } else {
      parameters.metalness = 0;
    }

    return new THREE.MeshStandardMaterial(parameters);
  }
  return oldMaterial;
}

function FbxModelAnimated({
  url,
  scale = 0.01,
  ...props
}: Readonly<FbxModelProps>) {
  const fbx = useLoader(FBXLoader, url);
  const groupRef = useRef<THREE.Group>(null!);
  const mixer = useMemo(() => new THREE.AnimationMixer(fbx), [fbx]);

  // Play the first animation clip if available.
  useEffect(() => {
    if (fbx.animations && fbx.animations.length > 0) {
      fbx.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }
  }, [fbx, mixer]);

  // Traverse the FBX scene and convert materials where needed.
  useEffect(() => {
    fbx.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log("Original material(s) for mesh:", child.material);
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat) => {
              const converted = convertToStandardMaterial(mat);
              console.log("Converted material:", converted);
              return converted;
            });
          } else {
            child.material = convertToStandardMaterial(child.material);
            console.log("Converted material:", child.material);
          }
        }
        if (child.userData && child.userData.extra) {
          console.log("Extra FBX data found:", child.userData.extra);
        }
      }
    });
  }, [fbx]);

  // Update the animation mixer on each frame.
  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <group ref={groupRef} {...props}>
      <primitive object={fbx} scale={scale} />
    </group>
  );
}

function FbxViewerWithAnimation() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0.5, 1.5], fov: 50 }}
    >
      {/* Ambient light provides a base level of illumination */}
      <ambientLight intensity={1} />

      {/* Primary directional light for strong highlights and shadows */}
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Extra directional light to fill in shadows and add depth */}
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />

      {/* Point light for localized illumination */}
      <pointLight position={[0, 5, 0]} intensity={0.75} distance={15} />

      {/* Hemisphere light adds subtle ambient light with a color gradient */}
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.5}
      />

      <OrbitControls
        enableZoom
        minDistance={1.5}
        maxDistance={5}
        enableRotate
        enablePan
        enableDamping
      />
      <Suspense fallback={null}>
        <FbxModelAnimated url="/models/drone 4 anim.fbx" scale={0.01} />
      </Suspense>
    </Canvas>
  );
}

export default FbxViewerWithAnimation;
