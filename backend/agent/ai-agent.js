import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Agente IA para Neo DMSTK
 * Funciones:
 * - Responder preguntas sobre el proyecto
 * - Analizar estado de tareas
 * - Sugerir prioridades
 * - Identificar riesgos
 */
class DMSTKAgent {
  constructor(tasks = [], owners = []) {
    this.tasks = tasks;
    this.owners = owners;
  }

  updateContext(tasks, owners) {
    this.tasks = tasks;
    this.owners = owners;
  }

  getProjectSummary() {
    const today = new Date();
    const overdue = this.tasks.filter(t =>
      t.status !== 'Hecho' && new Date(t.endDate) < today
    );
    const inProgress = this.tasks.filter(t => t.status === 'En curso');
    const blocked = this.tasks.filter(t => t.status === 'Bloqueado');
    const urgent = this.tasks.filter(t => t.status === 'Urgente');
    const milestones = this.tasks.filter(t => t.isMilestone);
    const completed = this.tasks.filter(t => t.status === 'Hecho');

    return {
      total: this.tasks.length,
      completed: completed.length,
      completionRate: ((completed.length / this.tasks.length) * 100).toFixed(1),
      overdue: overdue.length,
      inProgress: inProgress.length,
      blocked: blocked.length,
      urgent: urgent.length,
      milestones: milestones.length,
      milestonesCompleted: milestones.filter(m => m.status === 'Hecho').length
    };
  }

  async chat(userQuestion) {
    const summary = this.getProjectSummary();
    const today = new Date('2026-04-10');

    // Preparar contexto para el modelo
    const systemPrompt = `Eres un asistente inteligente para el proyecto NEO DMSTK.
Tu función es ayudar al equipo a monitorear y gestionar tareas.

DATOS DEL PROYECTO (hoy es ${today.toLocaleDateString('es-ES')}):
- Total de tareas: ${summary.total}
- Completadas: ${summary.completed} (${summary.completionRate}%)
- Vencidas: ${summary.overdue}
- En curso: ${summary.inProgress}
- Bloqueadas: ${summary.blocked}
- Urgentes: ${summary.urgent}
- Hitos totales: ${summary.milestones} (completados: ${summary.milestonesCompleted})

WORKSTREAMS:
Dirección, Legal, Método, Profesor-Contenido, Producto, Branding, Espacio-E1, Equipo, Piloto, Tecnología

EQUIPO:
${this.owners.join(', ')}

Responde de forma concisa, profesional y en español. Si te preguntan por tareas específicas,
usa la información disponible. Sé proactivo sugiriendo acciones cuando detectes problemas.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuestion }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error en OpenAI:', error);
      return this.fallbackResponse(userQuestion);
    }
  }

  // Respuesta fallback si OpenAI no está disponible
  fallbackResponse(question) {
    const q = question.toLowerCase();
    const summary = this.getProjectSummary();

    if (q.includes('vencidas') || q.includes('atrasadas') || q.includes('overdue')) {
      const overdue = this.tasks.filter(t =>
        t.status !== 'Hecho' && new Date(t.endDate) < new Date('2026-04-10')
      );
      return `Hay ${overdue.length} tareas vencidas:\n${overdue.slice(0, 5).map(t => `• ${t.name} (${t.owner})`).join('\n')}`;
    }

    if (q.includes('urgente') || q.includes('crítica')) {
      const urgent = this.tasks.filter(t => t.status === 'Urgente' || t.priority === 'Crítica');
      return `Hay ${urgent.length} tareas urgentes/críticas que requieren atención inmediata.`;
    }

    if (q.includes('bloqueada')) {
      const blocked = this.tasks.filter(t => t.status === 'Bloqueado');
      return `Hay ${blocked.length} tareas bloqueadas que están impidiendo el avance del proyecto.`;
    }

    if (q.includes('hito') || q.includes('milestone')) {
      const milestones = this.tasks.filter(t => t.isMilestone && t.status !== 'Hecho');
      const next = milestones.sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];
      return next
        ? `El próximo hito es "${next.name}" con fecha ${new Date(next.endDate).toLocaleDateString('es-ES')}`
        : 'Todos los hitos han sido completados.';
    }

    if (q.includes('progreso') || q.includes('estado') || q.includes('resumen')) {
      return `Estado del proyecto NEO DMSTK:
📊 ${summary.completed}/${summary.total} tareas completadas (${summary.completionRate}%)
⚠️ ${summary.overdue} tareas vencidas
🔄 ${summary.inProgress} en curso
🚨 ${summary.urgent} urgentes
🎯 ${summary.milestonesCompleted}/${summary.milestones} hitos completados`;
    }

    return `Resumen: ${summary.completed}/${summary.total} tareas completadas (${summary.completionRate}%). ${summary.overdue} tareas vencidas requieren atención.`;
  }

  /**
   * Análisis automático de riesgos
   */
  analyzeRisks() {
    const today = new Date('2026-04-10');
    const risks = [];

    // Tareas vencidas
    const overdue = this.tasks.filter(t =>
      t.status !== 'Hecho' && new Date(t.endDate) < today
    );
    if (overdue.length > 0) {
      risks.push({
        level: 'HIGH',
        type: 'OVERDUE',
        count: overdue.length,
        message: `${overdue.length} tareas vencidas`,
        tasks: overdue.slice(0, 3).map(t => ({ id: t.id, name: t.name, owner: t.owner }))
      });
    }

    // Tareas bloqueadas
    const blocked = this.tasks.filter(t => t.status === 'Bloqueado');
    if (blocked.length > 0) {
      risks.push({
        level: 'HIGH',
        type: 'BLOCKED',
        count: blocked.length,
        message: `${blocked.length} tareas bloqueadas`,
        tasks: blocked.map(t => ({ id: t.id, name: t.name, owner: t.owner }))
      });
    }

    // Hitos en riesgo (próximos 14 días)
    const riskMilestones = this.tasks.filter(t => {
      if (!t.isMilestone || t.status === 'Hecho') return false;
      const daysLeft = Math.ceil((new Date(t.endDate) - today) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 14;
    });
    if (riskMilestones.length > 0) {
      risks.push({
        level: 'MEDIUM',
        type: 'MILESTONE_RISK',
        count: riskMilestones.length,
        message: `${riskMilestones.length} hitos próximos a vencer`,
        tasks: riskMilestones.map(t => ({ id: t.id, name: t.name, endDate: t.endDate }))
      });
    }

    // Dependencias en riesgo
    const depsAtRisk = this.tasks.filter(t => {
      if (!t.deps || t.deps.length === 0 || t.status === 'Hecho') return false;
      const depTasks = t.deps.map(depId => this.tasks.find(task => task.id === depId));
      return depTasks.some(dep => dep && dep.status !== 'Hecho' && new Date(dep.endDate) >= new Date(t.startDate));
    });
    if (depsAtRisk.length > 0) {
      risks.push({
        level: 'MEDIUM',
        type: 'DEPENDENCY_RISK',
        count: depsAtRisk.length,
        message: `${depsAtRisk.length} tareas con dependencias en riesgo`
      });
    }

    return risks;
  }

  /**
   * Genera reporte diario
   */
  generateDailyReport() {
    const summary = this.getProjectSummary();
    const risks = this.analyzeRisks();
    const today = new Date('2026-04-10');

    const dueSoon = this.tasks.filter(t => {
      const daysLeft = Math.ceil((new Date(t.endDate) - today) / (1000 * 60 * 60 * 24));
      return t.status !== 'Hecho' && daysLeft >= 0 && daysLeft <= 7;
    });

    return {
      date: today.toISOString(),
      summary,
      risks,
      dueSoon: dueSoon.map(t => ({
        id: t.id,
        name: t.name,
        owner: t.owner,
        endDate: t.endDate,
        daysLeft: Math.ceil((new Date(t.endDate) - today) / (1000 * 60 * 60 * 24))
      })),
      recommendations: this.generateRecommendations(risks, summary)
    };
  }

  generateRecommendations(risks, summary) {
    const recommendations = [];

    if (summary.overdue > 0) {
      recommendations.push('Priorizar la resolución de tareas vencidas');
    }

    if (summary.blocked > 0) {
      recommendations.push('Revisar tareas bloqueadas y eliminar impedimentos');
    }

    if (summary.completionRate < 50 && summary.total > 20) {
      recommendations.push('Considerar reorganizar prioridades o añadir recursos');
    }

    const highRisks = risks.filter(r => r.level === 'HIGH');
    if (highRisks.length > 2) {
      recommendations.push('Reunión urgente recomendada para abordar riesgos críticos');
    }

    return recommendations;
  }
}

export default DMSTKAgent;
