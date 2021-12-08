/* eslint-disable no-shadow */
import { useRef } from 'react';
import { Vector3, Matrix4, Object3D } from 'three';
import { SpringValue } from '@react-spring/three';

/**
 *
 *
 * @param {*} { meshRef }
 * @return {*}
 */
function useAnimationInMesh({ meshRef }) {
  const refs = useRef({
    meshRef,
    id: null,
    matrix: new Matrix4(),
    position: new Vector3(),
    positionStart: new Vector3(),
    positionOn: false,
    scale: new Vector3(),
    scaleStart: new Vector3(),
    scaleOn: false,
    animatedObject: new Object3D(),
    spring: new SpringValue({
      config: { duration: 80 },
      onChange: (value) => {
        const {
          id,
          meshRef,
          matrix,
          position,
          positionStart,
          scale,
          scaleStart,
          animatedObject,
          positionOn,
          scaleOn,
        } = refs.current;
        meshRef.current.getMatrixAt(id, matrix);

        if (positionOn) {
          animatedObject.position.copy(positionStart.lerp(position, value));
        } else {
          position.setFromMatrixPosition(matrix);
          animatedObject.position.copy(position);
        }

        if (scaleOn) {
          animatedObject.scale.copy(scaleStart.lerp(scale, value));
        } else {
          scale.setFromMatrixScale(matrix);
          animatedObject.scale.copy(scale);
        }

        animatedObject.updateMatrix();
        meshRef.current.setMatrixAt(id, animatedObject.matrix);
        meshRef.current.instanceMatrix.needsUpdate = true;
      },
    }),
  });

  const animation = {
    start: (id, fn) => {
      refs.current.id = id;
      const { meshRef, matrix, position, positionStart, scale, scaleStart, spring } = refs.current;
      meshRef.current.getMatrixAt(id, matrix);
      position.setFromMatrixPosition(matrix);
      positionStart.copy(position);
      scale.setFromMatrixScale(matrix);
      scaleStart.copy(scale);
      fn({ position, scale }); // Here user can change the desired value
      refs.current.positionOn = !position.equals(positionStart);
      refs.current.scaleOn = !scale.equals(scaleStart);
      spring.start({ from: 0, to: 1 });
    },
  };

  return animation;
}

export default useAnimationInMesh;
