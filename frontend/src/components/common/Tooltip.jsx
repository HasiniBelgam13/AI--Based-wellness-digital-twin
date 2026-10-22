import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      {children || <HelpCircle size={15} style={{ color: 'var(--wn-text-muted)' }} />}
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--wn-text-primary)',
            color: 'var(--wn-text-inverse)',
            padding: '7px 12px',
            borderRadius: 'var(--wn-radius-sm)',
            fontSize: 12,
            lineHeight: 1.35,
            width: 240,
            textAlign: 'center',
            boxShadow: 'var(--wn-shadow-md)',
            zIndex: 999,
            pointerEvents: 'none',
            whiteSpace: 'normal'
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
