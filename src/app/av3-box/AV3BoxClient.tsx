'use client';

import { useState } from 'react';
import BoxViewer3D from './BoxViewer3D';
import DesignSelector from './DesignSelector';
import { BoxDesign } from './types';
import { getDefaultBoxDesign } from './boxDesigns';

export default function AV3BoxClient() {
  const [selectedDesign, setSelectedDesign] = useState<BoxDesign>(getDefaultBoxDesign());

  const handleDesignSelect = (design: BoxDesign) => {
    setSelectedDesign(design);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Background div */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: `
          linear-gradient(to bottom, #F5FAFE, #E7EDF3),
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)
        `,
        backgroundSize: '100% 100%, 30px 30px',
        zIndex: 1,
      }} />
      
      {/* Title */}
      <h1 className="font-mackinac" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#16161C',
        fontSize: '1.6rem',
        zIndex: 3,
        margin: 0,
      }}>
        AgeVisor 3 Box Design
      </h1>
      
      {/* Instructions */}
      <p style={{
        position: 'absolute',
        top: '55px',
        left: '20px',
        color: '#6b7280',
        fontSize: '0.8rem',
        zIndex: 3,
        margin: 0,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        Click and drag to rotate • Scroll to zoom
      </p>
      
      {/* Design Selector */}
      {/* <DesignSelector 
        selectedDesign={selectedDesign}
        onSelect={handleDesignSelect}
      /> */}
      
      {/* 3D Box Viewer */}
      <BoxViewer3D design={selectedDesign} />
    </div>
  );
}