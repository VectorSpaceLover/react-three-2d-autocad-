// import { Text } from '@react-three/drei';
import { useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import * as THREE from 'three';

import { Html } from '@react-three/drei';
import useAnimationInMesh from './AnimationInMesh';
import GestureControl from './GestureControl';

/**
 *
 *
 * @param {*} { data, onControl }
 * @return {*}
 */
function Spheres({ data, onControl }) {
  const meshRef = useRef();
  const colorBufferRef = useRef();

  const meshAnimation = useAnimationInMesh({ meshRef });

  const colorArray = useMemo(() => new Float32Array(data.length * 3), [data.length]);

  /** @type {*} */
  const updateInstancedMeshMatrices = useCallback(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();

    for (let i = 0; i < data.length; i += 1) {
      const { x, y, z, color, sx, sy } = data[i];
      // Position
      tempObject.position.set(x, y, z);
      tempObject.scale.set(sx, sy, 1);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color
      tempColor.set(color);
      tempColor.toArray(colorArray, i * 3);
    }
    console.log(colorArray);
    meshRef.current.instanceMatrix.needsUpdate = true;
    colorBufferRef.current.needsUpdate = true;
  }, []);

  useLayoutEffect(() => {
    updateInstancedMeshMatrices();
  }, []);

  /**
   *
   *
   * @param {*} { id, isOn }
   */
  const onPress = ({ id, isOn }) => {
    if (isOn) {
      onControl(true);
      meshAnimation.start(id, ({ scale }) => scale.multiplyScalar(1.2));
    } else {
      onControl(false);
      meshAnimation.start(id, ({ scale }) => scale.multiplyScalar(1 / 1.2));
    }
  };

  return (
    <mesh>
      <GestureControl
        onDragStart={(event) => onPress({ isOn: true, ...event })}
        onDragEnd={(event) => onPress({ isOn: false, ...event })}
      >
        <instancedMesh ref={meshRef} frustumCulled={false} args={[null, null, data.length]}>
          {/* <Text
            position={[0, 0, 0]}
            anchorX="center"
            anchorY="middle"
            fontSize={0.5}
            color="white"
            text="Test"
            z={10}
          /> */}
          <textGeometry args={[1.5, 1.5, 1.1]} text="Test">
            <instancedBufferAttribute
              ref={colorBufferRef}
              attachObject={['attributes', 'color']}
              args={[colorArray, 3]}
            />
            <instancedBufferAttribute attachObject={['attributes', 'text']} args={['Test', 1]} />
          </textGeometry>
          <sphereBufferGeometry attach="geometry" args={[0.2, 16, 16]}>
            <instancedBufferAttribute
              ref={colorBufferRef}
              attachObject={['attributes', 'color']}
              args={[colorArray, 3]}
            >
              <Html distanceFactor={10} style={{ color: 'white' }}>
                <div className="content">sdf</div>
              </Html>
            </instancedBufferAttribute>
          </sphereBufferGeometry>
          <meshStandardMaterial attach="material" vertexColors={THREE.VertexColors} />
        </instancedMesh>
      </GestureControl>
    </mesh>
  );
}

export default Spheres;
