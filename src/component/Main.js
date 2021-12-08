import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

import factoryPng from '../assets/factory.png';

/**
 *
 *
 * @return {*}
 */
function main() {
  const texture = useLoader(THREE.TextureLoader, factoryPng);

  return (
    <mesh>
      <planeBufferGeometry attach="geometry" args={[4, 4]} />
      <meshBasicMaterial attach="material" map={texture} toneMapped={false} />
    </mesh>
  );
}

export default main;
