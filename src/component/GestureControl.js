import { useRef, useEffect } from 'react';
import { Matrix4, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

/**
 *
 *
 * @param {*} {
 *   children,
 *   enabled = true,
 *   onDragStart = () => {},
 *   onDragEnd = () => {},
 *   onDrag = () => {},
 *   onHoverOn = () => {},
 *   onHoverOff = () => {},
 * }
 * @return {*}
 */
function GestureControls({
  children,
  enabled = true,
  onDragStart = () => {},
  onDragEnd = () => {},
  onDrag = () => {},
  onHoverOn = () => {},
  onHoverOff = () => {},
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const ref = useRef({
    plane: new Plane(),
    raycaster: new Raycaster(),
    mouse: new Vector2(),
    offset: new Vector3(),
    intersection: new Vector3(),
    inverseMatrix: new Matrix4(),
    selectedId: null,
    selectedPosition: new Vector3(),
    selectedMatrix: new Matrix4(),
    hoveredId: null,
  });

  /**
   *
   *
   * @param {*} event
   */
  const updateRaycaster = (event) => {
    const { mouse, raycaster } = ref.current;
    // Set mouse position
    const rect = gl.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    // Use raycaster on object
    raycaster.setFromCamera(mouse, camera);
  };

  /**
   *
   *
   * @param {*} event
   * @return {*}
   */
  const onPointerMove = (event) => {
    let { selectedId } = ref.current;
    const {
      hoveredId,
      plane,
      intersection,
      raycaster,
      offset,
      inverseMatrix,
      selectedMatrix,
      selectedPosition,
    } = ref.current;
    const object = children.ref.current;

    updateRaycaster(event);
    const intersections = raycaster.intersectObject(object);
    // If we are dragging, update the object position.
    if (selectedId && enabled) {
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        selectedPosition.copy(intersection.sub(offset).applyMatrix4(inverseMatrix));
        // selectedPosition.z = 0.1
        object.getMatrixAt(selectedId, selectedMatrix);
        selectedMatrix.setPosition(selectedPosition);
        object.setMatrixAt(selectedId, selectedMatrix);
        object.instanceMatrix.needsUpdate = true;
      }
      onDrag({ id: selectedId });
      return;
    }

    // Update hovered
    if (intersections.length > 0) {
      selectedId = intersections[0].instanceId;
      // Set hovered object if null or different
      if (hoveredId == null) {
        gl.domElement.style.cursor = 'grab';
        ref.current.hoveredId = selectedId;
        onHoverOn({ id: selectedId });
      }
    } else {
      // No intersection, discard hovered object
      gl.domElement.style.cursor = 'auto';
      ref.current.hoveredId = null;
      onHoverOff({ id: hoveredId });
    }
  };

  /**
   *
   *
   * @param {*} event
   */
  const onPointerDown = (event) => {
    event.preventDefault();

    let { selectedId } = ref.current;
    const {
      raycaster,
      plane,
      intersection,
      selectedMatrix,
      selectedPosition,
      inverseMatrix,
      offset,
    } = ref.current;
    const object = children.ref.current;
    updateRaycaster(event);
    const intersections = raycaster.intersectObject(object);

    if (intersections.length > 0) {
      const selected = intersections[0].object;
      selectedId = intersections[0].instanceId;
      ref.current.selectedId = intersections[0].instanceId;

      // Update selected matrix
      object.getMatrixAt(selectedId, selectedMatrix);
      // Save plane such that it will always drag the objects in the direction of the plane perpendicular to the camera and parallel to the object.
      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(plane.normal),
        selectedPosition.setFromMatrixPosition(selectedMatrix)
      );
      // Compute inverseMatrix and offset using plane, intersection, and selected matrix
      if (raycaster.ray.intersectPlane(plane, intersection) && selected.parent) {
        inverseMatrix.copy(selected.parent.matrixWorld).invert();
        object.getMatrixAt(selectedId, selectedMatrix);
        selectedPosition.setFromMatrixPosition(selectedMatrix);
        offset.copy(intersection).sub(selectedPosition);
      }
      gl.domElement.style.cursor = 'grabbing';
      onDragStart({ id: selectedId });
    }
  };

  /**
   *
   *
   * @param {*} event
   */
  const onPointerCancel = (event) => {
    event.preventDefault();

    const { selectedId, hoveredId } = ref.current;

    if (selectedId) {
      gl.domElement.style.cursor = hoveredId ? 'grab' : 'auto';
      ref.current.selectedId = null;
      onDragEnd({ id: selectedId });
    }
  };

  /**
   *
   *
   * @param {*} event
   */
  const onTouchMove = (event) => onPointerMove(event.changedTouches[0]);

  /**
   *
   *
   * @param {*} event
   */
  const onTouchStart = (event) => onPointerDown(event.changedTouches[0]);

  /**
   *
   *
   * @param {*} event
   */
  const onTouchEnd = (event) => onPointerCancel(event.changedTouches[0]);

  useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointerup', onPointerCancel);
    dom.addEventListener('pointerleave', onPointerCancel);
    dom.addEventListener('touchmove', onPointerMove);
    dom.addEventListener('touchstart', onPointerDown);
    dom.addEventListener('touchend', onPointerCancel);

    return () => {
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointerup', onPointerCancel);
      dom.removeEventListener('pointerleave', onPointerCancel);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return <group>{children}</group>;
}

export default GestureControls;
