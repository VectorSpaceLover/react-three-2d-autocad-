import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, MapControls } from '@react-three/drei';

import Main from './Main';
import Loader from './Loader';
import Spheres from './Spheres';
import SphereItem from './SphereItem';

/**
 * Color palette:
 *
 * Green : #26de81
 * Yellow : #F79F1F
 * Red: #ff7675
 *
 *
 * @return {*}
 */
function Engine() {
  const [enabledControls, setEnabledControls] = useState(true);
  // , setEnabledControls

  const staticData = [
    { name: 'Name 1', pv: -20, status: 'normal' },
    { name: 'Name 2', pv: 100, status: 'normal' },
    { name: 'Name 3', pv: 400, status: 'faulty' },
    { name: 'Name 4', pv: 0, status: 'normal' },
    { name: 'Name 5', pv: 82, status: 'faulty' },
    { name: 'Name 6', pv: 15, status: 'normal' },
    { name: 'Name 7', pv: 400, status: 'normal' },
    { name: 'Name 8', pv: 39, status: 'normal' },
    { name: '名字 9', pv: -73, status: 'dangerous' },
    { name: '名字 10', pv: 82, status: 'normal' },
    { name: '名字 11', pv: 15, status: 'normal' },
    { name: '名字 12', pv: 400, status: 'normal' },
    { name: '名字 13', pv: 39, status: 'normal' },
    { name: '名字 14', pv: -73, status: 'dangerous' },
    { name: '名字 15', pv: -198, status: 'normal' },
    { name: '名字 16', pv: 76, status: 'faulty' },
  ];

  /**
   *
   *
   * @param {*} status
   * @return {*}
   */
  const getColorByStatus = (status) => {
    switch (status) {
      case 'faulty':
        return '#F79F1F';
      case 'dangerous':
        return '#ff7675';
      case 'normal':
      default:
        return '#26de81';
    }
  };

  const cylinderData = useMemo(() => {
    const size = 16;
    const data = new Array(size).fill().map((_, id) => ({ id }));

    for (let index = 0; index < size; index += 1) {
      const rows = Math.floor(Math.sqrt(size));
      const resColor = getColorByStatus(staticData[index].status);

      data[index].x = (index % rows) * 1.0 - (rows / 2) * 1.0;
      data[index].y = Math.floor(index / rows) * 1.0 - (rows / 2) * 1.0;
      data[index].z = 0.0;
      data[index].sx = 0.8;
      data[index].sy = 0.8;
      data[index].color = resColor;
      data[index].name = staticData[index].name;
      data[index].pv = staticData[index].pv;
      data[index].status = staticData[index].status;
    }

    return data;
  }, []);

  return (
    <Suspense fallback={<span>loading...</span>}>
      <Canvas
        linear
        invalidateFrameloop
        pixelRatio={window.devicePixelRatio}
        gl={{ antialias: false, stencil: false, alpha: false, depth: false }}
        camera={{ zoom: 2, position: [0, 0, 5], up: [0, 0, 1] }}
        performance={{ min: 0.1 }}
      >
        <Suspense fallback={<Loader />}>
          <Main />

          <ambientLight color={0xffffff} intensity={0.8} />
          <pointLight position={[0, 100, 100]} intensity={0.2} />
          <spotLight position={[0, 0, 1000]} angle={0.15} penumbra={1} intensity={0.5} />
          {true && (
            <Spheres data={cylinderData} onControl={(enabled) => setEnabledControls(!enabled)} />
          )}

          {true && <SphereItem data={cylinderData} />}

          <Preload all />

          <MapControls
            panSpeed={1}
            enableDamping={false}
            enableRotate={false}
            enabled={enabledControls}
          />
        </Suspense>
      </Canvas>
    </Suspense>
  );
}

export default Engine;
