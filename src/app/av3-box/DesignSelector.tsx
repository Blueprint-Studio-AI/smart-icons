'use client';

import { BoxDesign } from './types';
import { boxDesigns } from './boxDesigns';

interface DesignSelectorProps {
  selectedDesign: BoxDesign;
  onSelect: (design: BoxDesign) => void;
}

export default function DesignSelector({ selectedDesign, onSelect }: DesignSelectorProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '20px',
      zIndex: 3,
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '200px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      <h3 className="font-mackinac" style={{
        margin: '0 0 12px 0',
        fontSize: '1.1rem',
        color: '#16161C',
      }}>
        Select Design
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {boxDesigns.map((design) => (
          <button
            key={design.id}
            onClick={() => onSelect(design)}
            // className="font-mackinac"
            style={{
              padding: '8px 12px',
              border: selectedDesign.id === design.id ? '2px solid #007acc' : '2px solid transparent',
              borderRadius: '4px',
              background: selectedDesign.id === design.id ? '#f0f8ff' : '#ffffff',
              color: '#16161C',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedDesign.id !== design.id) {
                e.currentTarget.style.background = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedDesign.id !== design.id) {
                e.currentTarget.style.background = '#ffffff';
              }
            }}
          >
            <div style={{ fontWeight: '500' }}>{design.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}