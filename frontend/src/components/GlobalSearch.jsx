/**
 * BUSCADOR GLOBAL CON HASHTAGS
 * Búsqueda inteligente que permite:
 * - Buscar por hashtags (#DARUMA, #PILOTO, etc.)
 * - Buscar por texto libre
 * - Ver resultados categorizados
 * - Click en resultado para abrir modal 5Ws
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X, Hash, User, Briefcase, FileText } from 'lucide-react';
import { searchTasks, categorizeSearchResults, generateHashtags } from '../utils/hashtagGenerator';

const PALETTE = {
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  bone: "#FFFDF9",
  warm: "#F3EDE6",
  cream: "#FAF8F4",
  lagune: "#6398A9",
  nectarine: "#D7897F",
  mostaza: "#E2B93B",
  menthe: "#96C7B3",
};

export default function GlobalSearch({ tasks, onTaskClick }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [categorized, setCategorized] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar cuando cambia el query
  useEffect(() => {
    if (query.trim()) {
      const foundTasks = searchTasks(tasks, query);
      setResults(foundTasks);
      setCategorized(categorizeSearchResults(tasks, query));
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setCategorized(null);
      setIsOpen(false);
    }
  }, [query, tasks]);

  // Navegación con teclado
  useEffect(() => {
    function handleKeyDown(event) {
      if (!isOpen || results.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter' && results[selectedIndex]) {
        event.preventDefault();
        handleTaskClick(results[selectedIndex]);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, results, selectedIndex]);

  function handleTaskClick(task) {
    if (onTaskClick) {
      onTaskClick(task);
    }
    setIsOpen(false);
    setQuery('');
  }

  function clearSearch() {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  // Sugerencias de hashtags populares
  const popularHashtags = ['#DARUMA', '#PILOTO', '#SoftOpening', '#Contrato', '#Legal', '#Urgente'];

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
      {/* Input de búsqueda */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            color: PALETTE.muted,
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Buscar tareas... (ej: #DARUMA, apertura, legal)"
          style={{
            width: '100%',
            padding: '10px 40px 10px 38px',
            fontSize: 14,
            borderRadius: 8,
            border: `1px solid ${isOpen ? PALETTE.lagune : PALETTE.faint}`,
            background: PALETTE.bone,
            color: PALETTE.ink,
            outline: 'none',
            transition: 'all 0.2s',
          }}
        />
        {query && (
          <button
            onClick={clearSearch}
            style={{
              position: 'absolute',
              right: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} color={PALETTE.muted} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: PALETTE.bone,
          border: `1px solid ${PALETTE.faint}`,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: 500,
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {/* Header con contador */}
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${PALETTE.faint}`,
            background: PALETTE.warm,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink }}>
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </div>
            {query.startsWith('#') && (
              <div style={{
                fontSize: 11,
                color: PALETTE.soft,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Hash size={12} />
                Búsqueda por hashtag
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
            }}>
              <Search size={40} color={PALETTE.faint} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: PALETTE.muted, marginBottom: 16 }}>
                No se encontraron resultados para "{query}"
              </div>

              {/* Sugerencias de hashtags */}
              <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>
                Prueba con estos hashtags:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {popularHashtags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    style={{
                      padding: '4px 10px',
                      fontSize: 11,
                      borderRadius: 4,
                      border: `1px solid ${PALETTE.faint}`,
                      background: PALETTE.cream,
                      color: PALETTE.lagune,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = PALETTE.lagune;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = PALETTE.cream;
                      e.currentTarget.style.color = PALETTE.lagune;
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Resultados por hashtag */}
              {categorized && Object.keys(categorized.byHashtag).length > 0 && (
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${PALETTE.faint}` }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: PALETTE.muted,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <Hash size={12} />
                    Por hashtag
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(categorized.byHashtag).slice(0, 5).map(([tag, tasks]) => (
                      <div
                        key={tag}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11,
                          borderRadius: 4,
                          background: PALETTE.lagune + '15',
                          color: PALETTE.lagune,
                          fontWeight: 600,
                        }}
                      >
                        {tag} ({tasks.length})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de tareas */}
              <div style={{ padding: '8px 0' }}>
                {results.slice(0, 20).map((task, index) => {
                  const isSelected = index === selectedIndex;
                  const hashtags = generateHashtags(task);

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      style={{
                        padding: '12px 16px',
                        background: isSelected ? PALETTE.warm : 'transparent',
                        borderLeft: isSelected ? `3px solid ${PALETTE.lagune}` : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: 6,
                      }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: PALETTE.ink,
                          flex: 1,
                        }}>
                          {task.isMilestone && <span style={{ color: PALETTE.mostaza, marginRight: 6 }}>◆</span>}
                          {task.name}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 11,
                        color: PALETTE.soft,
                        marginBottom: 6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Briefcase size={11} />
                          {task.ws}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} />
                          {task.owner}
                        </div>
                        <div style={{
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: task.status === 'Hecho' ? PALETTE.menthe + '20' :
                                     task.status === 'En curso' ? PALETTE.mostaza + '20' :
                                     task.status === 'Urgente' ? PALETTE.nectarine + '20' : PALETTE.faint,
                          color: task.status === 'Hecho' ? PALETTE.menthe :
                                 task.status === 'En curso' ? PALETTE.mostaza :
                                 task.status === 'Urgente' ? PALETTE.nectarine : PALETTE.soft,
                          fontSize: 10,
                          fontWeight: 600,
                        }}>
                          {task.status}
                        </div>
                      </div>

                      {/* Hashtags */}
                      {hashtags.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 4,
                          marginTop: 6,
                        }}>
                          {hashtags.slice(0, 6).map(tag => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 3,
                                background: PALETTE.cream,
                                color: PALETTE.lagune,
                                fontWeight: 500,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {hashtags.length > 6 && (
                            <span style={{
                              fontSize: 10,
                              color: PALETTE.muted,
                            }}>
                              +{hashtags.length - 6}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {results.length > 20 && (
                  <div style={{
                    padding: '12px 16px',
                    fontSize: 11,
                    color: PALETTE.muted,
                    textAlign: 'center',
                    borderTop: `1px solid ${PALETTE.faint}`,
                  }}>
                    ... y {results.length - 20} resultados más
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer con instrucciones */}
          <div style={{
            padding: '10px 16px',
            borderTop: `1px solid ${PALETTE.faint}`,
            background: PALETTE.warm,
            fontSize: 10,
            color: PALETTE.muted,
            display: 'flex',
            gap: 16,
          }}>
            <span>↑↓ Navegar</span>
            <span>↵ Seleccionar</span>
            <span>ESC Cerrar</span>
          </div>
        </div>
      )}
    </div>
  );
}
