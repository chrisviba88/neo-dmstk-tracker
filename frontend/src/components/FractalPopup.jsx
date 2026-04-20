/**
 * FRACTAL POPUP
 * Pop-up inteligente que muestra información profunda de cualquier métrica
 * - Rápido (no cambia de página)
 * - Editable (modificar inline)
 * - Fractal (click en cualquier elemento para profundizar más)
 */

import { useState } from 'react';
import { X, ChevronRight, Edit2, Save } from 'lucide-react';

const PALETTE = {
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  bone: "#FFFDF9",
  warm: "#F3EDE6",
  cream: "#FAF8F4",
};

export default function FractalPopup({
  isOpen,
  onClose,
  title,
  icon,
  items = [],
  onItemClick,
  onItemEdit,
  renderItem,
  subtitle,
  stats
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.name || '');
  };

  const handleSave = (item) => {
    if (onItemEdit) {
      onItemEdit(item.id, editValue);
    }
    setEditingId(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}
    onClick={onClose}
    >
      <div style={{
        background: PALETTE.bone,
        borderRadius: 16,
        width: '100%',
        maxWidth: 700,
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${PALETTE.faint}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
            <div>
              <h2 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: PALETTE.ink,
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: 13,
                  color: PALETTE.soft,
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.warm}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} color={PALETTE.soft} />
          </button>
        </div>

        {/* Stats (opcional) */}
        {stats && (
          <div style={{
            padding: '16px 24px',
            background: PALETTE.warm,
            borderBottom: `1px solid ${PALETTE.faint}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 16,
          }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: stat.color || PALETTE.ink,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 11,
                  color: PALETTE.soft,
                  marginTop: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: PALETTE.muted,
            }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                No hay elementos para mostrar
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 16px',
                      background: item.bg || PALETTE.cream,
                      border: `1px solid ${item.borderColor || PALETTE.faint}`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      cursor: onItemClick ? 'pointer' : 'default',
                    }}
                    onMouseEnter={(e) => {
                      if (onItemClick) {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (onItemClick) {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Render custom si se provee */}
                    {renderItem ? (
                      <div style={{ flex: 1 }} onClick={() => onItemClick && onItemClick(item)}>
                        {renderItem(item)}
                      </div>
                    ) : (
                      <>
                        {/* Default render */}
                        <div
                          style={{ flex: 1 }}
                          onClick={() => onItemClick && onItemClick(item)}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave(item);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: 14,
                                border: `1px solid ${PALETTE.soft}`,
                                borderRadius: 4,
                                background: PALETTE.bone,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div>
                              <div style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: item.textColor || PALETTE.ink,
                                marginBottom: 4,
                              }}>
                                {item.icon && <span style={{ marginRight: 6 }}>{item.icon}</span>}
                                {item.name}
                              </div>
                              {item.subtitle && (
                                <div style={{
                                  fontSize: 12,
                                  color: PALETTE.soft,
                                }}>
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          {onItemEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isEditing) {
                                  handleSave(item);
                                } else {
                                  handleEdit(item);
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 6,
                                borderRadius: 4,
                                display: 'flex',
                                transition: 'background 0.2s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.faint}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              {isEditing ? (
                                <Save size={14} color={PALETTE.soft} />
                              ) : (
                                <Edit2 size={14} color={PALETTE.soft} />
                              )}
                            </button>
                          )}
                          {onItemClick && (
                            <ChevronRight size={18} color={PALETTE.muted} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
