/**
 * 5-DAY BUSINESS CALENDAR
 * Muestra los próximos 5 días laborables con tareas que vencen
 * Clickeable para ver detalles de cada tarea (5Ws)
 */

import { useState, useMemo } from 'react';
import { getTaskColor, SEMANTIC_COLORS } from '../utils/semanticColors';
import { Calendar, ChevronRight } from 'lucide-react';

const PALETTE = {
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  bone: "#FFFDF9",
  warm: "#F3EDE6",
  cream: "#FAF8F4",
};

/**
 * Obtiene los próximos N días laborables (lunes-viernes)
 */
function getNextBusinessDays(count = 5) {
  const days = [];
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  while (days.length < count) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Formatea fecha en español
 */
function formatDate(date, format = 'full') {
  const options = {
    full: { weekday: 'short', day: 'numeric', month: 'short' },
    short: { day: 'numeric', month: 'short' },
    day: { weekday: 'long' },
  };

  return date.toLocaleDateString('es-ES', options[format] || options.full);
}

/**
 * Verifica si dos fechas son el mismo día
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export default function FiveDayCalendar({ tasks, onTaskClick, onUpdateTask }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);
  const businessDays = useMemo(() => getNextBusinessDays(5), []);
  const today = useMemo(() => new Date(), []);

  // Agrupar tareas por día
  const tasksByDay = useMemo(() => {
    const grouped = new Map();

    businessDays.forEach(day => {
      const dayTasks = tasks.filter(task => {
        const taskEndDate = new Date(task.endDate);
        taskEndDate.setHours(0, 0, 0, 0);
        return isSameDay(taskEndDate, day);
      });

      grouped.set(day.toISOString(), {
        date: day,
        tasks: dayTasks,
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'Hecho').length,
        overdue: dayTasks.filter(t => {
          const taskDate = new Date(t.endDate);
          return taskDate < today && t.status !== 'Hecho';
        }).length,
      });
    });

    return grouped;
  }, [tasks, businessDays, today]);

  // Handlers para drag & drop
  const handleDragStart = (task, e) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (dayKey) => {
    setDragOverDay(dayKey);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = (targetDate, e) => {
    e.preventDefault();
    setDragOverDay(null);

    if (!draggedTask || !onUpdateTask) {
      setDraggedTask(null);
      return;
    }

    // Formatear la nueva fecha
    const newEndDate = targetDate.toISOString().split('T')[0];
    const oldEndDate = draggedTask.endDate;

    // Si la fecha no cambió, no hacer nada
    if (newEndDate === oldEndDate) {
      setDraggedTask(null);
      return;
    }

    // Validar dependencias
    if (draggedTask.deps && draggedTask.deps.length > 0) {
      const hasBlockingDeps = draggedTask.deps.some(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (!depTask) return false;

        const depEndDate = new Date(depTask.endDate);
        return depEndDate > targetDate && depTask.status !== 'Hecho';
      });

      if (hasBlockingDeps) {
        const confirmed = confirm(
          `⚠️ Esta tarea tiene dependencias que aún no están completadas.\n\n` +
          `Mover la fecha podría crear conflictos.\n\n` +
          `¿Deseas continuar de todos modos?`
        );

        if (!confirmed) {
          setDraggedTask(null);
          return;
        }
      }
    }

    // Actualizar la tarea
    onUpdateTask(draggedTask.id, { endDate: newEndDate });
    setDraggedTask(null);
  };

  return (
    <div style={{
      background: PALETTE.bone,
      border: `1px solid ${PALETTE.faint}`,
      borderRadius: 12,
      padding: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${PALETTE.faint}`,
      }}>
        <Calendar size={20} color={PALETTE.soft} />
        <h3 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          color: PALETTE.ink,
        }}>
          Próximos 5 días laborables
        </h3>
      </div>

      {/* Days Grid */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
      }}>
        {businessDays.map(day => {
          const dayKey = day.toISOString();
          const dayData = tasksByDay.get(dayKey) || { tasks: [], total: 0, completed: 0, overdue: 0 };
          const isToday = isSameDay(day, today);
          const isSelected = selectedDay === dayKey;
          const isDragOver = dragOverDay === dayKey;

          return (
            <DayCard
              key={dayKey}
              date={day}
              tasks={dayData.tasks}
              total={dayData.total}
              completed={dayData.completed}
              overdue={dayData.overdue}
              isToday={isToday}
              isSelected={isSelected}
              isDragOver={isDragOver}
              onClick={() => setSelectedDay(isSelected ? null : dayKey)}
              onTaskClick={onTaskClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(dayKey)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(day, e)}
              draggedTaskId={draggedTask?.id}
            />
          );
        })}
      </div>

      {/* No tasks message */}
      {Array.from(tasksByDay.values()).every(d => d.total === 0) && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: PALETTE.muted,
        }}>
          <Calendar size={48} color={PALETTE.faint} style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14 }}>
            No hay tareas programadas para los próximos 5 días
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Card individual de día
 */
function DayCard({
  date, tasks, total, completed, overdue, isToday, isSelected, isDragOver,
  onClick, onTaskClick, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, draggedTaskId
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Determinar color del borde
  const getBorderColor = () => {
    if (isDragOver) return SEMANTIC_COLORS.taskStatus['En curso'].border;
    if (overdue > 0) return SEMANTIC_COLORS.temporal.overdue.border;
    if (isToday) return SEMANTIC_COLORS.taskStatus['En curso'].border;
    if (percentage === 100) return SEMANTIC_COLORS.health.excellent.text;
    return PALETTE.faint;
  };

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        minWidth: 180,
        background: isDragOver ? SEMANTIC_COLORS.taskStatus['En curso'].bg :
                   isToday ? PALETTE.warm : PALETTE.cream,
        border: `2px solid ${getBorderColor()}`,
        borderRadius: 8,
        padding: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isSelected || isDragOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected || isDragOver ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {/* Date Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 11,
          textTransform: 'uppercase',
          color: PALETTE.muted,
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {isToday && <span style={{
            background: SEMANTIC_COLORS.taskStatus['En curso'].bg,
            color: SEMANTIC_COLORS.taskStatus['En curso'].text,
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
          }}>HOY</span>}
          {formatDate(date, 'day')}
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: PALETTE.ink,
        }}>
          {formatDate(date, 'short')}
        </div>
      </div>

      {/* Stats */}
      {total > 0 ? (
        <>
          {/* Progress bar */}
          <div style={{
            height: 6,
            background: PALETTE.faint,
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              height: '100%',
              width: `${percentage}%`,
              background: percentage === 100
                ? SEMANTIC_COLORS.health.excellent.text
                : SEMANTIC_COLORS.taskStatus['En curso'].border,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Task count */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: PALETTE.soft,
            marginBottom: 8,
          }}>
            <span>{completed} de {total} tareas</span>
            {overdue > 0 && (
              <span style={{
                background: SEMANTIC_COLORS.temporal.overdue.bg,
                color: SEMANTIC_COLORS.temporal.overdue.text,
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
              }}>
                🚨 {overdue}
              </span>
            )}
          </div>

          {/* Task list (when selected) */}
          {isSelected && (
            <div style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${PALETTE.faint}`,
              maxHeight: 200,
              overflowY: 'auto',
            }}>
              {tasks.slice(0, 5).map(task => {
                const colors = getTaskColor(task);
                const isDragging = draggedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      onDragStart && onDragStart(task, e);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick && onTaskClick(task);
                    }}
                    style={{
                      padding: '6px 8px',
                      marginBottom: 4,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      fontSize: 11,
                      color: colors.text,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'transform 0.1s ease, opacity 0.2s ease',
                      opacity: isDragging ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => !isDragging && (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <span>{colors.icon}</span>
                    <span style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {task.name}
                    </span>
                    <ChevronRight size={12} />
                  </div>
                );
              })}
              {tasks.length > 5 && (
                <div style={{
                  textAlign: 'center',
                  fontSize: 10,
                  color: PALETTE.muted,
                  marginTop: 8,
                }}>
                  +{tasks.length - 5} más
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          fontSize: 12,
          color: PALETTE.muted,
        }}>
          Sin tareas
        </div>
      )}
    </div>
  );
}
