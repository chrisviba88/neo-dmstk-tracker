#!/usr/bin/env node
/**
 * Generador de datos enriquecidos v2 para Neo DMSTK
 * Toma los datos RAW del spec + reglas de asignacion y genera tasks-v2.js
 *
 * Ejecutar: node generate-tasks-v2.js
 */

// =============================================
// RAW DATA: [id, name, ws, priority, endDate, owner, isMilestone, project, notes, status, startDate, risk]
// =============================================
const RAW = [
["t01","Reunion presupuesto Mavi","Direccion","P0","2026-04-15","David",false,"Fundacion & Metodo","Sin presupuesto no arranca. URGENTE.","En curso","2026-04-10","ALTO"],
["t02","Confirmar fecha GO/NO-GO","Direccion","P0","2026-04-11","David",false,"Fundacion & Metodo","Fecha inmovible: 20 junio","En curso","2026-04-10","MEDIO"],
["t03","Reporting semanal","Direccion","P1","2026-04-18","David",false,"Fundacion & Metodo","Recurrente semanal.","Pendiente","2026-04-14","BAJO"],
["t04","Weekly standup","Direccion","P1","2026-06-20","David",false,"Fundacion & Metodo","Reunion semanal.","Pendiente","2026-04-21","BAJO"],
["t05","Presentacion GO/NO-GO","Direccion","P0","2026-06-15","David",false,"Fundacion & Metodo","Presentacion board.","Pendiente","2026-06-08","ALTO"],
["t06","GO/NO-GO con board","Direccion","P0","2026-06-20","David",true,"Fundacion & Metodo","HITO CRITICO. Inmovible.","Pendiente","2026-06-20","CRITICO"],
["t07","Activar fase escala","Direccion","P0","2026-06-25","David",false,"Fundacion & Metodo","Contrataciones, E2-E5.","Pendiente","2026-06-21","MEDIO"],
["t08","Contrato profesor/a (borrador)","Legal","P0","2026-04-18","Cristina",false,"Fundacion & Metodo","Redactar ESTA SEMANA.","En curso","2026-04-10","ALTO"],
["t09","Contrato coach Miguel","Legal","P1","2026-04-18","Cristina",false,"Fundacion & Metodo","Honorarios Miguel.","En curso","2026-04-10","MEDIO"],
["t10","Negociar con profesor/a","Legal","P0","2026-05-02","David",false,"Fundacion & Metodo","Buffer 1 dia tras t08/t30.","Pendiente","2026-04-26","ALTO"],
["t11","Firma contrato profesor/a","Legal","P0","2026-05-05","David",false,"Fundacion & Metodo","Buffer 1 dia tras t10.","Pendiente","2026-05-03","MEDIO"],
["t12","Registro marca OEPM","Legal","P0","2026-04-30","Cristina",false,"Fundacion & Metodo","Agosto paraliza OEPM.","En curso","2026-04-14","ALTO"],
["t13","Licencia actividad Monteagudo","Legal","P1","2026-06-30","Cristina",false,"Espacio E1","CONSTRAINT AGOSTO.","En curso","2026-04-14","CRITICO"],
["t14","Licencia servir alcohol","Legal","P1","2026-06-30","Cristina",false,"Espacio E1","Soft opening sin alcohol si no.","En curso","2026-04-14","ALTO"],
["t15","RGPD consentimiento","Legal","P1","2026-05-15","Cristina",false,"Fundacion & Metodo","Datos personales.","Pendiente","2026-05-01","MEDIO"],
["t16","Formulario derechos imagen","Legal","P1","2026-05-15","Cristina",false,"Fundacion & Metodo","Grabaciones y social.","Pendiente","2026-05-01","MEDIO"],
["t17","Contrato empresa reformas","Legal","P0","2026-07-05","Cristina",false,"Espacio E1","Antes vacaciones.","Pendiente","2026-06-25","ALTO"],
["t18","Licencia de obra","Legal","P1","2026-06-15","Cristina",false,"Espacio E1","Junio-julio.","Pendiente","2026-06-01","ALTO"],
["t19","Contratos laborales equipo","Legal","P0","2026-06-30","Cristina",false,"Espacio E1","Facilitador, manager.","Pendiente","2026-06-01","MEDIO"],
["t19b","Seguros espacio","Legal","P1","2026-07-15","Cristina",false,"Espacio E1","RC, contenido.","Pendiente","2026-07-01","MEDIO"],
["t20","Metodo PERMA ejecutable","Metodo","P0","2026-04-18","David",false,"Fundacion & Metodo","3 capas, 2 niveles.","En curso","2026-03-01","MEDIO"],
["t21","Exp. Alquiler+Kit","Metodo","P1","2026-04-28","David",false,"Fundacion & Metodo","Exp 1: Solo.","Pendiente","2026-04-21","MEDIO"],
["t22","Exp. Sesion corta","Metodo","P0","2026-04-28","David",false,"Piloto & Validacion","Exp 2: Grupo 90-120 min.","Pendiente","2026-04-21","ALTO"],
["t23","Exp. Programa largo","Metodo","P0","2026-05-05","David",false,"Piloto & Validacion","Exp 3: 4 sesiones.","Pendiente","2026-04-21","ALTO"],
["t24","Protocolo Daruma","Metodo","P1","2026-04-28","David",false,"Kit & Producto","Ojo inicio/cierre.","Pendiente","2026-04-21","MEDIO"],
["t25","Manual operativo v0","Metodo","P0","2026-05-12","David",false,"Piloto & Validacion","Sin manual, improvisa.","Pendiente","2026-05-06","CRITICO"],
["t26","Manual operativo v1","Metodo","P0","2026-07-15","David",false,"Espacio E1","Post-piloto.","Pendiente","2026-06-22","ALTO"],
["t27","Manual operativo v2","Metodo","P1","2026-08-01","David",false,"Formacion Facilitadores","Certificable E2-E5.","Pendiente","2026-07-15","MEDIO"],
["t28","Protocolo perfiles extremos","Metodo","P1","2026-05-05","David",false,"Fundacion & Metodo","Participantes dificiles.","Pendiente","2026-04-21","MEDIO"],
["t29","Protocolo alcohol","Metodo","P1","2026-05-05","David",false,"Fundacion & Metodo","Politica alcohol.","Pendiente","2026-04-21","MEDIO"],
["t30","Confirmar tecnica + profesor/a","Profesor-Contenido","P0","2026-04-25","David",false,"Fundacion & Metodo","DEADLINE 25 ABR.","En curso","2026-04-10","CRITICO"],
["t31","Briefing profesor/a","Profesor-Contenido","P0","2026-05-08","David",false,"Fundacion & Metodo","90 min post-contrato.","Pendiente","2026-05-06","MEDIO"],
["t32","Propuesta 2-3 proyectos","Profesor-Contenido","P0","2026-05-11","Profesora",false,"Fundacion & Metodo","MVP + Avanzado.","Pendiente","2026-05-09","MEDIO"],
["t33","Seleccion proyecto final","Profesor-Contenido","P0","2026-05-14","David",false,"Fundacion & Metodo","Jardin que crece?","Pendiente","2026-05-12","MEDIO"],
["t34","Prototipo MVP (novato)","Profesor-Contenido","P0","2026-05-21","Profesora",false,"Piloto & Validacion","Cronometrado NOVATO.","Pendiente","2026-05-15","ALTO"],
["t35","Lista materiales exactos","Profesor-Contenido","P0","2026-05-19","Profesora",false,"Kit & Producto","Marca, ref, cantidades.","Pendiente","2026-05-15","ALTO"],
["t36","Paletas de colores","Profesor-Contenido","P1","2026-05-19","Profesora",false,"Kit & Producto","3-4 paletas.","Pendiente","2026-05-15","MEDIO"],
["t37","Reclutar 5-8 testers","Profesor-Contenido","P1","2026-05-16","David",false,"Piloto & Validacion","Mezcla niveles.","Pendiente","2026-05-05","MEDIO"],
["t38","Test validacion","Profesor-Contenido","P0","2026-05-22","David",true,"Piloto & Validacion","HITO. 80%+ MVP.","Pendiente","2026-05-22","CRITICO"],
["t39","Evaluar resultados test","Profesor-Contenido","P0","2026-05-24","David",false,"Piloto & Validacion","GO grabacion?","Pendiente","2026-05-23","ALTO"],
["t40","Reservar estudio grabacion","Profesor-Contenido","P1","2026-04-28","Miguel Marquez",false,"Fundacion & Metodo","Domestika jun.","En curso","2026-04-14","MEDIO"],
["t41","Guiones todos modulos","Profesor-Contenido","P0","2026-06-05","Miguel Marquez",false,"Fundacion & Metodo","~50 piezas.","Pendiente","2026-05-27","ALTO"],
["t42","Grabacion (3 dias set)","Profesor-Contenido","P0","2026-06-11","Miguel Marquez",true,"Fundacion & Metodo","HITO. NO repetible.","Pendiente","2026-06-09","CRITICO"],
["t43","Edicion ~50 modulos","Profesor-Contenido","P0","2026-07-08","Miguel Marquez",false,"Fundacion & Metodo","Edicion completa.","Pendiente","2026-06-18","ALTO"],
["t44","Subtitulos ES+EN + espejo zurdos","Profesor-Contenido","P1","2026-07-05","Miguel Marquez",false,"Fundacion & Metodo","Espejo IMPRESCINDIBLE.","Pendiente","2026-06-25","MEDIO"],
["t45","Videos en plataforma","Profesor-Contenido","P0","2026-07-16","Equipo Tech",false,"Stack Tecnologico","Web propia, QR.","Pendiente","2026-07-09","ALTO"],
["t46","QRs definitivos para kits","Profesor-Contenido","P1","2026-07-22","Equipo Tech",false,"Kit & Producto","Impresos.","Pendiente","2026-07-17","MEDIO"],
["t50","Diseno 3D Daruma","Producto","P0","2026-04-18","Por asignar",false,"Daruma 3D","Dani puede? URGENTE.","En curso","2026-04-10","CRITICO"],
["t51","Proveedor 3D Madrid","Producto","P0","2026-04-18","Christian",false,"Daruma 3D","Local piloto.","En curso","2026-04-14","ALTO"],
["t52","Pedido Daruma piloto (50-80)","Producto","P0","2026-04-28","Christian",false,"Daruma 3D","Buffer 4 dias.","Pendiente","2026-04-22","ALTO"],
["t53a","Buscar ceramico Europa","Producto","P1","2026-04-30","Por asignar",false,"Kit & Producto","Portugal, Talavera.","En curso","2026-04-14","MEDIO"],
["t53b","Pedido Daruma Europa","Producto","P1","2026-06-01","Por asignar",false,"Kit & Producto","200-500 uds.","Pendiente","2026-05-15","MEDIO"],
["t53c","Recepcion Daruma Europa","Producto","P1","2026-08-10","Por asignar",false,"Kit & Producto","6-8 semanas.","Pendiente","2026-07-15","MEDIO"],
["t54","Sourcing materiales","Producto","P1","2026-04-30","Por asignar",false,"Kit & Producto","Katia/Alimaravillas.","En curso","2026-04-14","MEDIO"],
["t55","Kits piloto (20-30)","Producto","P0","2026-05-24","Por asignar",true,"Piloto & Validacion","HITO. 19 may o NO arranca.","Pendiente","2026-05-20","CRITICO"],
["t56","Diseno instrucciones kit","Producto","P1","2026-05-26","Por asignar",false,"Kit & Producto","ES/EN.","Pendiente","2026-05-15","MEDIO"],
["t57","Diseno packaging","Producto","P1","2026-06-14","Por asignar",false,"Kit & Producto","Necesita identidad.","Pendiente","2026-06-03","MEDIO"],
["t58","Kits definitivos (50+)","Producto","P0","2026-08-13","Por asignar",false,"Espacio E1","Soft opening.","Pendiente","2026-07-23","ALTO"],
["t59","Merch diseno","Producto","P2","2026-06-30","Por asignar",false,"Branding","Tote, mug, pins.","Pendiente","2026-06-01","BAJO"],
["t60","Merch produccion","Producto","P2","2026-08-15","Por asignar",false,"Branding","Produccion E1.","Pendiente","2026-07-01","BAJO"],
["t70","Confirmar estudio branding","Branding","P1","2026-04-14","David",false,"Branding","ESTA SEMANA.","En curso","2026-04-10","MEDIO"],
["t71","Brief branding + naming","Branding","P1","2026-04-21","David",false,"Branding","Brief completo.","Pendiente","2026-04-15","MEDIO"],
["t72","Naming final","Branding","P1","2026-05-12","Estudio Branding",false,"Branding","Nombre final.","Pendiente","2026-04-28","MEDIO"],
["t73","Identidad visual final","Branding","P0","2026-05-30","Estudio Branding",true,"Branding","HITO. 5+ dependen.","Pendiente","2026-04-28","CRITICO"],
["t74","Web lista de espera","Branding","P1","2026-06-10","Equipo Tech",false,"Branding","Landing.","Pendiente","2026-06-03","MEDIO"],
["t75","Canal IG+TikTok activo","Branding","P1","2026-06-10","Por asignar",false,"Branding","CM.","Pendiente","2026-06-03","MEDIO"],
["t76","Lista espera (300-500)","Branding","P1","2026-08-31","Por asignar",false,"Branding","Campana.","Pendiente","2026-06-11","MEDIO"],
["t77","Performance marketing","Branding","P1","2026-10-01","Por asignar",false,"Branding","~3K EUR/mes.","Pendiente","2026-06-15","MEDIO"],
["t78","Narrativa PR","Branding","P1","2026-07-31","David",false,"Branding","Historia medios.","Pendiente","2026-07-01","BAJO"],
["t79","PR con soft opening","Branding","P1","2026-09-01","Por asignar",false,"Espacio E1","Prensa.","Pendiente","2026-08-25","BAJO"],
["t80","Grand Opening E1","Branding","P0","2026-10-01","David",true,"Espacio E1","HITO FINAL E1.","Pendiente","2026-10-01","ALTO"],
["t53","Proyecto obra Monteagudo","Espacio-E1","P0","2026-05-30","Christian",false,"Espacio E1","PB+P1. Visita martes agencia reforma.","En curso","2026-04-14","ALTO"],
["t81","Empresa reformas (AGOSTO)","Espacio-E1","P0","2026-05-15","Christian",false,"Espacio E1","Sin agosto +2-3 sem.","En curso","2026-04-14","CRITICO"],
["t82","Presupuestos obra (min 3)","Espacio-E1","P1","2026-05-30","Christian",false,"Espacio E1","3 comparativos.","Pendiente","2026-05-01","MEDIO"],
["t83","Inicio reforma E1","Espacio-E1","P0","2026-06-25","Empresa Reformas",true,"Espacio E1","HITO. INMOVIBLE. PB+P1 Madrid.","Pendiente","2026-06-25","CRITICO"],
["t84","Obra y acondicionamiento","Espacio-E1","P0","2026-08-20","Empresa Reformas",false,"Espacio E1","8 sem. AGOSTO obligatorio.","Pendiente","2026-06-25","ALTO"],
["t85","Equipamiento","Espacio-E1","P1","2026-08-10","Christian",false,"Espacio E1","Mesas, luz, audio.","Pendiente","2026-07-01","MEDIO"],
["t86","Diseno sensorial","Espacio-E1","P1","2026-08-15","Christian",false,"Espacio E1","Aroma, temp, flujo.","Pendiente","2026-07-01","MEDIO"],
["t87a","Senaletica + rincon foto","Espacio-E1","P1","2026-08-25","Christian",false,"Espacio E1","Post-obra + identidad.","Pendiente","2026-08-10","MEDIO"],
["t88a","Montaje zona retail","Espacio-E1","P1","2026-08-25","Christian",false,"Espacio E1","Tienda.","Pendiente","2026-08-10","BAJO"],
["t89a","Check final espacio","Espacio-E1","P0","2026-08-29","Christian",true,"Espacio E1","HITO pre-soft.","Pendiente","2026-08-26","ALTO"],
["t92","Soft Opening E1","Espacio-E1","P0","2026-09-01","David",true,"Espacio E1","HITO MAYOR. 1 sept.","Pendiente","2026-09-01","CRITICO"],
["t87","Perfil facilitador","Equipo","P0","2026-04-18","David",false,"Formacion","Definir perfil.","En curso","2026-04-10","MEDIO"],
["t88","Reunion Lupi","Equipo","P1","2026-04-18","Christian",false,"Formacion","Perfiles y tech.","En curso","2026-04-14","BAJO"],
["t89","Busqueda facilitador","Equipo","P0","2026-04-28","David",false,"Formacion","Activa.","Pendiente","2026-04-19","ALTO"],
["t90","Seleccion facilitador","Equipo","P0","2026-05-05","David",false,"Formacion","Si no, fundadores.","Pendiente","2026-04-29","ALTO"],
["t91","Formacion facilitador (5d)","Equipo","P0","2026-05-12","David",false,"Formacion","Requiere manual v0.","Pendiente","2026-05-06","ALTO"],
["t91b","Certificacion facilitador","Equipo","P0","2026-05-17","David",true,"Formacion","HITO. Sin cert, no piloto.","Pendiente","2026-05-13","ALTO"],
["t93","Seleccion manager E1","Equipo","P1","2026-06-30","David",false,"Espacio E1","Manager E1.","Pendiente","2026-06-01","MEDIO"],
["t93b","Formacion manager","Equipo","P1","2026-07-31","David",false,"Espacio E1","Manual v1.","Pendiente","2026-07-01","MEDIO"],
["t94","Seleccion anfitrion/a","Equipo","P1","2026-07-15","David",false,"Espacio E1","Recepcion.","Pendiente","2026-06-15","BAJO"],
["t94b","Formacion anfitrion/a","Equipo","P1","2026-08-15","Por asignar",false,"Espacio E1","Por manager.","Pendiente","2026-07-16","BAJO"],
["t95","Criterios GO/NO-GO","Piloto","P0","2026-04-21","David",false,"Piloto & Validacion","3 criterios binarios.","En curso","2026-04-14","CRITICO"],
["t96","Reclutar participantes","Piloto","P1","2026-05-16","David",false,"Piloto & Validacion","48-96 part.","Pendiente","2026-04-21","MEDIO"],
["t97","Monteagudo piloto","Piloto","P1","2026-05-16","Christian",false,"Piloto & Validacion","Ambiental basico.","Pendiente","2026-05-01","MEDIO"],
["t97b","Encuesta NPS","Piloto","P1","2026-05-05","David",false,"Piloto & Validacion","5 preguntas.","Pendiente","2026-04-28","BAJO"],
["t98","Piloto arranca","Piloto","P0","2026-05-19","Facilitador",true,"Piloto & Validacion","HITO. INMOVIBLE.","Pendiente","2026-05-19","CRITICO"],
["t99","Sesiones cortas (8x2/sem)","Piloto","P0","2026-06-13","Facilitador",false,"Piloto & Validacion","4 sem. ~64 part.","Pendiente","2026-05-19","ALTO"],
["t100","Programa largo (4x1/sem)","Piloto","P0","2026-06-13","Facilitador",false,"Piloto & Validacion","~12 part.","Pendiente","2026-05-19","ALTO"],
["t100b","Contenido social piloto","Piloto","P1","2026-06-13","Miguel Marquez",false,"Branding","Stories, reels.","Pendiente","2026-05-19","BAJO"],
["t101","Analizar datos piloto","Piloto","P0","2026-06-17","David",false,"Piloto & Validacion","NPS, satisfaccion.","Pendiente","2026-06-14","ALTO"],
["t102","Informe GO/NO-GO","Piloto","P0","2026-06-18","David",true,"Piloto & Validacion","HITO. Board 20 jun.","Pendiente","2026-06-18","CRITICO"],
["t110","Reunion Lupi tech","Tecnologia","P1","2026-04-18","Christian",false,"Stack Tecnologico","Consulta.","En curso","2026-04-14","BAJO"],
["t111","Decidir stack tech","Tecnologia","P1","2026-04-25","Christian",false,"Stack Tecnologico","Sin decision, no arranca.","En curso","2026-04-14","CRITICO"],
["t112","Sistema reservas","Tecnologia","P1","2026-05-15","Equipo Tech",false,"Stack Tecnologico","Calendario+paleta+pago.","Pendiente","2026-04-26","ALTO"],
["t113","CRM basico","Tecnologia","P1","2026-05-30","Equipo Tech",false,"Stack Tecnologico","Clientes, comms.","Pendiente","2026-05-01","MEDIO"],
["t114","Web videos (player+QR)","Tecnologia","P0","2026-07-05","Equipo Tech",false,"Stack Tecnologico","Plataforma propia.","Pendiente","2026-05-16","ALTO"],
["t115","Emails automaticos","Tecnologia","P1","2026-06-15","Equipo Tech",false,"Stack Tecnologico","Pre/post sesion.","Pendiente","2026-05-16","MEDIO"],
["t116","Test stack produccion","Tecnologia","P0","2026-08-28","Equipo Tech",true,"Stack Tecnologico","HITO. Pre-soft.","Pendiente","2026-08-20","ALTO"],
["E1-001","Confirmar Dani Daruma","E1-Extra","P0","2026-04-16","David",false,"E1 Daruma","URGENTE.","Pendiente","2026-04-14","ALTO"],
["E1-002","Briefing diseno Daruma","E1-Extra","P0","2026-04-18","David",false,"E1 Daruma","Brief.","Pendiente","2026-04-17","MEDIO"],
["E1-003","Buscar proveedor 3D","E1-Extra","P0","2026-04-22","Por asignar",false,"E1 Daruma","3-5 proveedores.","Pendiente","2026-04-18","ALTO"],
["E1-004","Cotizaciones Daruma","E1-Extra","P1","2026-04-25","Por asignar",false,"E1 Daruma","Cotiz + leads.","Pendiente","2026-04-23","MEDIO"],
["E1-005","Seleccion proveedor Daruma","E1-Extra","P0","2026-04-28","David",true,"E1 Daruma","Lead <6 sem.","Pendiente","2026-04-26","ALTO"],
["E1-006","Pedido Daruma 50-80","E1-Extra","P0","2026-04-30","Por asignar",false,"E1 Daruma","Urgente.","Pendiente","2026-04-29","ALTO"],
["E1-007","Seguimiento Daruma","E1-Extra","P1","2026-06-15","Por asignar",false,"E1 Daruma","Semanal.","Pendiente","2026-05-05","MEDIO"],
["E1-008","QC Daruma","E1-Extra","P1","2026-06-18","Por asignar",false,"E1 Daruma","Quality Control.","Pendiente","2026-06-16","MEDIO"],
["E1-009","Elementos kit (9 disc)","E1-Extra","P1","2026-04-25","David",false,"E1 Kits","Por disciplina.","Pendiente","2026-04-21","MEDIO"],
["E1-010","Sourcing materiales","E1-Extra","P1","2026-05-05","Por asignar",false,"E1 Kits","9 disciplinas.","Pendiente","2026-04-26","MEDIO"],
["E1-011","Diseno packaging kit","E1-Extra","P1","2026-05-12","Por asignar",false,"E1 Kits","Packaging.","Pendiente","2026-05-06","MEDIO"],
["E1-012","Prototipo kit completo","E1-Extra","P1","2026-05-16","Por asignar",false,"E1 Kits","1/disciplina.","Pendiente","2026-05-13","MEDIO"],
["E1-013","Test kits en piloto","E1-Extra","P1","2026-06-13","Por asignar",false,"E1 Kits","Feedback.","Pendiente","2026-05-19","MEDIO"],
["E1-014","Ajustes kit post-piloto","E1-Extra","P1","2026-06-20","Por asignar",false,"E1 Kits","Mejoras.","Pendiente","2026-06-14","BAJO"],
["E1-015","Produccion kits soft","E1-Extra","P1","2026-07-15","Por asignar",false,"E1 Kits","80-100.","Pendiente","2026-06-21","MEDIO"],
["E1-016","Estrategia contenido","E1-Extra","P1","2026-06-07","Por asignar",false,"E1 Branding","90 dias.","Pendiente","2026-06-01","MEDIO"],
["E1-017","Calendario IG/TikTok","E1-Extra","P1","2026-06-10","Por asignar",false,"E1 Branding","Jul-sept.","Pendiente","2026-06-08","BAJO"],
["E1-018","Produccion contenido","E1-Extra","P1","2026-06-25","Por asignar",false,"E1 Branding","10 piezas.","Pendiente","2026-06-11","MEDIO"],
["E1-019","Influencers Madrid","E1-Extra","P2","2026-07-15","Por asignar",false,"E1 Branding","5-10 micro.","Pendiente","2026-07-01","MEDIO"],
["E1-020","Email mktg lista espera","E1-Extra","P1","2026-08-25","Por asignar",false,"E1 Branding","3 campanas.","Pendiente","2026-07-15","BAJO"],
["E1-021","Brief agencia PR","E1-Extra","P1","2026-06-20","David",false,"E1 Branding","PR Madrid.","Pendiente","2026-06-15","MEDIO"],
["E1-022","Contratar agencia PR","E1-Extra","P1","2026-06-28","David",false,"E1 Branding","Seleccionar.","Pendiente","2026-06-21","MEDIO"],
["E1-023","Kit prensa opening","E1-Extra","P1","2026-07-15","Por asignar",false,"E1 Branding","Dossier.","Pendiente","2026-07-01","BAJO"],
["E1-024","Capacitacion CRM","E1-Extra","P1","2026-08-16","Por asignar",false,"E1 Tech","Formacion.","Pendiente","2026-08-15","MEDIO"],
["E1-025","Capacitacion reservas","E1-Extra","P1","2026-08-17","Por asignar",false,"E1 Tech","Formacion.","Pendiente","2026-08-16","MEDIO"],
["E1-026","Manual stack tech","E1-Extra","P1","2026-08-14","Por asignar",false,"E1 Tech","Operativo.","Pendiente","2026-08-10","BAJO"],
["E1-027","Testing pago-reservas-CRM","E1-Extra","P0","2026-08-22","Por asignar",false,"E1 Tech","E2E.","Pendiente","2026-08-20","ALTO"],
["E1-028","Plan contingencia","E1-Extra","P1","2026-08-24","Por asignar",false,"E1 Tech","Plan B.","Pendiente","2026-08-23","MEDIO"],
["E1-029","Testing carga 100","E1-Extra","P1","2026-08-26","Por asignar",false,"E1 Tech","Stress test.","Pendiente","2026-08-25","MEDIO"],
["E1-030","Seguimiento licencias","E1-Extra","P0","2026-07-31","Cristina",false,"E1 Legal","Semanal hasta jul.","Pendiente","2026-04-14","ALTO"],
["E1-031","Plan aceleracion licencias","E1-Extra","P0","2026-04-18","Cristina",false,"E1 Legal","Plan B.","Pendiente","2026-04-15","ALTO"],
["E1-032","Politicas privacidad","E1-Extra","P1","2026-06-20","Cristina",false,"E1 Legal","RGPD.","Pendiente","2026-06-15","MEDIO"],
["E1-033","Aviso legal y T&C","E1-Extra","P1","2026-06-25","Cristina",false,"E1 Legal","Web+servicio.","Pendiente","2026-06-21","MEDIO"],
["E1-034","Registro DPO","E1-Extra","P2","2026-07-05","Cristina",false,"E1 Legal","Evaluar.","Pendiente","2026-07-01","BAJO"],
["E1-035","Aprobacion ayuntamiento","E1-Extra","P0","2026-06-24","Christian",false,"E1 Construccion","Pre-25 jun.","Pendiente","2026-06-15","ALTO"],
["E1-036","Check inicio obra","E1-Extra","P1","2026-06-25","Christian",false,"E1 Construccion","Dia 1.","Pendiente","2026-06-25","MEDIO"],
["E1-037","Inspeccion sem 2","E1-Extra","P1","2026-07-09","Christian",false,"E1 Construccion","Check.","Pendiente","2026-07-09","MEDIO"],
["E1-038","Inspeccion mid-point","E1-Extra","P0","2026-07-23","Christian",false,"E1 Construccion","50%.","Pendiente","2026-07-23","ALTO"],
["E1-039","Inspeccion sem 6","E1-Extra","P1","2026-08-06","Christian",false,"E1 Construccion","Pre-final.","Pendiente","2026-08-06","MEDIO"],
["E1-040","Certificado final obra","E1-Extra","P0","2026-08-28","Christian",false,"E1 Construccion","Sin cert NO abrimos.","Pendiente","2026-08-27","ALTO"],
["E1-041","Correcciones post-obra","E1-Extra","P1","2026-08-29","Christian",false,"E1 Construccion","Snags.","Pendiente","2026-08-28","BAJO"],
["E1-042","Sourcing mobiliario","E1-Extra","P1","2026-06-20","Por asignar",false,"E1 Equipamiento","3 cotiz.","Pendiente","2026-06-10","MEDIO"],
["E1-043","Sourcing AV","E1-Extra","P1","2026-06-30","Por asignar",false,"E1 Equipamiento","Audio, luz.","Pendiente","2026-06-21","MEDIO"],
["E1-044","Instalacion AV","E1-Extra","P1","2026-08-22","Por asignar",false,"E1 Equipamiento","Profesional.","Pendiente","2026-08-20","MEDIO"],
["E1-045","Testing AV","E1-Extra","P0","2026-08-24","Christian",false,"E1 Equipamiento","Pre-soft.","Pendiente","2026-08-23","ALTO"],
["E1-046","Manual AV","E1-Extra","P1","2026-08-26","Por asignar",false,"E1 Equipamiento","Para equipo.","Pendiente","2026-08-25","BAJO"],
["E1-047","Facilitador backup","E1-Extra","P0","2026-05-15","David",false,"E1 Facilitadores","Plan B.","Pendiente","2026-05-10","ALTO"],
["E1-048","Formacion backup","E1-Extra","P1","2026-05-20","Miguel",false,"E1 Facilitadores","Completa.","Pendiente","2026-05-16","MEDIO"],
["E1-049","Practica backup","E1-Extra","P1","2026-08-20","Miguel",false,"E1 Facilitadores","Pre-soft.","Pendiente","2026-08-15","MEDIO"],
["E1-050","Manual facilitador v1.5","E1-Extra","P1","2026-06-30","David",false,"E1 Facilitadores","Mejorada.","Pendiente","2026-06-21","BAJO"],
["E1-051","Sistema vouchers","E1-Extra","P1","2026-07-20","Por asignar",false,"E1 Producto","Diseno+tech.","Pendiente","2026-07-10","MEDIO"],
["E1-052","Pricing merch","E1-Extra","P1","2026-07-08","David",false,"E1 Producto","Precios.","Pendiente","2026-07-05","BAJO"],
["E1-053","Display retail","E1-Extra","P1","2026-08-25","Por asignar",false,"E1 Producto","Visual.","Pendiente","2026-08-20","BAJO"],
["E1-054","Manual operativo SOP","E1-Extra","P0","2026-08-05","Por asignar",false,"E1 Operaciones","Apertura, cierre, emergencias.","Pendiente","2026-07-20","ALTO"],
["E1-055","Protocolos atencion","E1-Extra","P0","2026-08-10","Por asignar",false,"E1 Operaciones","Check-in, sesion.","Pendiente","2026-08-06","ALTO"],
["E1-056","Formacion anfitrion","E1-Extra","P0","2026-08-15","Por asignar",false,"E1 Operaciones","Intensiva.","Pendiente","2026-08-11","ALTO"],
["E1-057","Simulacros (3 runs)","E1-Extra","P0","2026-08-28","Por asignar",false,"E1 Operaciones","Dry runs.","Pendiente","2026-08-25","ALTO"],
["E1-058","Checklist diaria","E1-Extra","P1","2026-08-28","Por asignar",false,"E1 Operaciones","Apertura/cierre.","Pendiente","2026-08-27","BAJO"],
["E1-059","Lista invitados soft","E1-Extra","P1","2026-07-20","David",false,"E1 Soft Opening","50-80.","Pendiente","2026-07-15","MEDIO"],
["E1-060","Invitaciones soft","E1-Extra","P1","2026-08-10","Por asignar",false,"E1 Soft Opening","Diseno+envio.","Pendiente","2026-08-01","BAJO"],
["E1-061","Feedback soft","E1-Extra","P0","2026-09-02","Por asignar",false,"E1 Soft Opening","Post-opening.","Pendiente","2026-09-01","ALTO"],
["E1-062","Ajustes post-soft","E1-Extra","P0","2026-09-10","Por asignar",false,"E1 Soft Opening","Pre-grand.","Pendiente","2026-09-03","ALTO"],
["E1-063","Estrategia suscripcion","E1-Extra","P0","2026-09-25","David",false,"E1 Grand Opening","Post-grand.","Pendiente","2026-09-15","ALTO"],
["E1-064","Plan 80 suscriptores","E1-Extra","P0","2026-09-30","David",false,"E1 Grand Opening","KPI critico.","Pendiente","2026-09-26","ALTO"],
["E1-065","Dashboard KPIs","E1-Extra","P1","2026-09-28","Por asignar",false,"E1 Grand Opening","Seguimiento.","Pendiente","2026-09-25","MEDIO"],
["E1-066","Control presupuesto E1","Direccion","P1","2026-10-01","David",false,"E1 Finanzas","Semanal.","Pendiente","2026-04-14","MEDIO"],
["E1-067","Cashflow E1","Direccion","P1","2026-10-01","David",false,"E1 Finanzas","Mensual.","Pendiente","2026-05-01","MEDIO"],
["E2-001","Kick-off busqueda BCN","Barcelona","P1","2026-07-05","Christian",false,"E2 Barcelona","Post GO/NO-GO.","Pendiente","2026-07-01","MEDIO"],
["E2-002","Busqueda activa locales","Barcelona","P0","2026-08-02","Christian",false,"E2 Barcelona","4 sem intensivas.","Pendiente","2026-07-06","ALTO"],
["E2-003","Seleccion finalistas (top 3)","Barcelona","P0","2026-08-10","David",true,"E2 Barcelona","Top 3 locales.","Pendiente","2026-08-03","ALTO"],
["E2-004","Constitucion sociedad BCN","Barcelona","P1","2026-08-15","Cristina",false,"E2 Barcelona","Entidad separada?","Pendiente","2026-07-15","MEDIO"],
["E2-005","Negociacion local #1","Barcelona","P0","2026-08-25","Christian",false,"E2 Barcelona","Negociacion activa.","Pendiente","2026-08-11","ALTO"],
["E2-006","Negociacion backup","Barcelona","P1","2026-09-05","Por asignar",false,"E2 Barcelona","Si #1 falla.","Pendiente","2026-08-26","MEDIO"],
["E2-007","Firma alquiler E2","Barcelona","P1","2026-09-10","Por asignar",false,"E2 Barcelona","Contrato.","Pendiente","2026-09-06","MEDIO"],
];

// =============================================
// NEW TASKS from Christian's notes (2026-04-16)
// =============================================
const NEW_TASKS_RAW = [
// MET family - Metodo & Experiencias
["t150","Definir tecnicas iniciales","Metodo","P0","2026-04-16","David",false,"Fundacion & Metodo","Con cuales de estas tecnicas comenzamos.","Pendiente","2026-04-16","ALTO"],
["t151","Significado para el participante","Metodo","P1","2026-04-17","David",false,"Fundacion & Metodo","Que significado podria darle la persona que lo haga.","Pendiente","2026-04-16","MEDIO"],
["t152","Disenar experiencia sesion larga","Metodo","P0","2026-04-17","David",false,"Piloto & Validacion","Paso a paso, integracion PERMA. Draft con IA.","Pendiente","2026-04-16","ALTO"],
["t153","Disenar experiencia sesion corta","Metodo","P0","2026-04-17","David",false,"Piloto & Validacion","Paso a paso, integracion PERMA. Draft con IA.","Pendiente","2026-04-16","ALTO"],
["t154","Disenar experiencia kit","Metodo","P1","2026-04-17","David",false,"Kit & Producto","Paso a paso, integracion PERMA. Draft con IA.","Pendiente","2026-04-16","ALTO"],
["t155","Integracion PERMA en experiencias","Metodo","P0","2026-04-17","David",false,"Fundacion & Metodo","Como incluimos PERMA en cada tipo de sesion.","Pendiente","2026-04-16","ALTO"],

// CON family - Contenido & Proyectos
["t160","Auditar cursos existentes Domestika","Profesor-Contenido","P0","2026-04-16","David",false,"Fundacion & Metodo","Que podemos extraer de los cursos existentes.","Pendiente","2026-04-16","ALTO"],
["t161","Explorar .com para contenido extraible","Profesor-Contenido","P0","2026-04-16","David",false,"Fundacion & Metodo","Buscar con IA que se puede rescatar de videos grabados.","Pendiente","2026-04-16","ALTO"],
["t162","Definir 3 primeros proyectos","Profesor-Contenido","P0","2026-04-16","David",false,"Fundacion & Metodo","Cuales son los 3 proyectos iniciales.","Pendiente","2026-04-16","CRITICO"],
["t163","Crear presentacion de proyectos","Profesor-Contenido","P0","2026-04-16","David",false,"Fundacion & Metodo","Presentacion visual con descripcion, imagenes, videos.","Pendiente","2026-04-16","ALTO"],
["t164","Descripcion por que elegimos cada proyecto","Profesor-Contenido","P0","2026-04-16","David",false,"Fundacion & Metodo","Minima descripcion de seleccion.","Pendiente","2026-04-16","MEDIO"],
["t165","Curar referencias visuales proyectos","Profesor-Contenido","P0","2026-04-16","David",false,"Fundacion & Metodo","Rescatar videos e imagenes relacionados a los proyectos seleccionados.","Pendiente","2026-04-16","ALTO"],
["t166","Mapear cursos a proyectos","Profesor-Contenido","P1","2026-04-17","David",false,"Fundacion & Metodo","Buscar que cursos podemos extraer contenido para los proyectos.","Pendiente","2026-04-16","ALTO"],
["t167","Pedir acceso a JuanMa","Profesor-Contenido","P0","2026-04-17","David",false,"Fundacion & Metodo","Acceso a herramienta para llegar a videos existentes.","Pendiente","2026-04-16","ALTO"],
["t168","Seleccionar proyectos bonitos","Profesor-Contenido","P1","2026-04-17","David",false,"Fundacion & Metodo","Incluir links, videos, imagenes para ilustrar.","Pendiente","2026-04-16","MEDIO"],

// CON/EQU - Colaboradores
["t170","Identificar colaboradores potenciales","Profesor-Contenido","P1","2026-04-24","David",false,"Fundacion & Metodo","Idealmente en Madrid, que permitan grabacion. Semana siguiente.","Pendiente","2026-04-20","MEDIO"],
["t171","Evaluar rol colaborador/profesor","Profesor-Contenido","P1","2026-04-17","David",false,"Fundacion & Metodo","Que tan importante es el colaborador/profesor en el proyecto.","Pendiente","2026-04-16","MEDIO"],

// EQU - Facilitadores
["t172","Evaluar necesidad facilitador","Equipo","P1","2026-04-17","David",false,"Formacion","Necesitamos facilitador? Analisis.","Pendiente","2026-04-16","MEDIO"],
["t173","Hipotesis perfil facilitadores","Equipo","P1","2026-04-17","David",false,"Formacion","Tipo animador? Ex-profesor? Primer perfil hipotetico.","Pendiente","2026-04-16","MEDIO"],
];

// =============================================
// MAPPING RULES from spec
// =============================================

// Family definitions: { familyCode: { label, epicId, pillar, milestone, scope, defaultSpaces } }
const FAMILIES = {
  DIR: { label: "Direccion & Decision", epicId: "t06", pillar: "direccion", milestone: "goNoGo", scope: "global", spaces: [] },
  LEG: { label: "Legal & Licencias", epicId: "t13", pillar: "legal", milestone: "softOpeningE1", scope: "global", spaces: [] },
  MET: { label: "Metodo PERMA", epicId: "t20", pillar: "metodo", milestone: "piloto", scope: "global", spaces: [] },
  CON: { label: "Contenido Video", epicId: "t42", pillar: "contenido", milestone: "softOpeningE1", scope: "global", spaces: [] },
  DAR: { label: "Daruma Ritual", epicId: "t50", pillar: "daruma", milestone: "piloto", scope: "global", spaces: [] },
  KIT: { label: "Kits Experiencia", epicId: "t55", pillar: "kits", milestone: "piloto", scope: "global", spaces: [] },
  RET: { label: "Retail & Merch", epicId: "t60", pillar: "retail", milestone: "grandOpeningE1", scope: "global", spaces: [] },
  BRA: { label: "Marca & Branding", epicId: "t73", pillar: "branding", milestone: "piloto", scope: "global", spaces: [] },
  // WEB merged into TEC
  RED: { label: "Redes & Marketing", epicId: "t75", pillar: "redes", milestone: "softOpeningE1", scope: "global", spaces: [] },
  EQU: { label: "Equipo & Formacion", epicId: "t91b", pillar: "equipo", milestone: "piloto", scope: "global", spaces: [] },
  TEC: { label: "Tecnologia & Web", epicId: "t116", pillar: "tech", milestone: "softOpeningE1", scope: "global", spaces: [] },
  PIL: { label: "Piloto & Validacion", epicId: "t102", pillar: "piloto", milestone: "goNoGo", scope: "space", spaces: ["E1"] },
  ESP1: { label: "Espacio E1 Madrid", epicId: "t92", pillar: "espacio", milestone: "reformaE1", scope: "space", spaces: ["E1"] },
  OPS1: { label: "Operaciones E1", epicId: "E1-057", pillar: "ops", milestone: "softOpeningE1", scope: "space", spaces: ["E1"] },
  ESP2: { label: "E2 Barcelona", epicId: "E2-003", pillar: "espacio", milestone: "softOpeningE2", scope: "space", spaces: ["E2"] },
};

// Task ID → Family code mapping
const TASK_FAMILY = {};

// DIR
["t01","t02","t03","t04","t05","t06","t07","E1-066","E1-067"].forEach(id => TASK_FAMILY[id] = "DIR");
// LEG
["t08","t09","t10","t11","t12","t13","t14","t15","t16","t17","t18","t19","t19b","E1-030","E1-031","E1-032","E1-033","E1-034"].forEach(id => TASK_FAMILY[id] = "LEG");
// MET
["t20","t21","t22","t23","t24","t25","t26","t27","t28","t29","E1-050","t150","t151","t152","t153","t154","t155"].forEach(id => TASK_FAMILY[id] = "MET");
// CON
["t30","t31","t32","t33","t40","t41","t42","t43","t44","t45","t46","t160","t161","t162","t163","t164","t165","t166","t167","t168","t170","t171"].forEach(id => TASK_FAMILY[id] = "CON");
// DAR
["t50","t51","t52","t53a","t53b","t53c","E1-001","E1-002","E1-003","E1-004","E1-005","E1-006","E1-007","E1-008"].forEach(id => TASK_FAMILY[id] = "DAR");
// KIT
["t35","t36","t54","t55","t56","t57","t58","E1-009","E1-010","E1-011","E1-012","E1-013","E1-014","E1-015"].forEach(id => TASK_FAMILY[id] = "KIT");
// RET
["t59","t60","E1-051","E1-052","E1-053"].forEach(id => TASK_FAMILY[id] = "RET");
// BRA
["t70","t71","t72","t73","t78"].forEach(id => TASK_FAMILY[id] = "BRA");
// TEC (includes WEB tasks t114, t74)
["t110","t111","t112","t113","t114","t115","t116","t74","E1-024","E1-025","E1-026","E1-027","E1-028","E1-029"].forEach(id => TASK_FAMILY[id] = "TEC");
// RED
["t75","t76","t77","t79","t100b","E1-016","E1-017","E1-018","E1-019","E1-020","E1-021","E1-022","E1-023"].forEach(id => TASK_FAMILY[id] = "RED");
// EQU
["t87","t88","t89","t90","t91","t91b","t93","t93b","t94","t94b","E1-047","E1-048","E1-049","t172","t173"].forEach(id => TASK_FAMILY[id] = "EQU");
// PIL
["t34","t37","t38","t39","t95","t96","t97","t97b","t98","t99","t100","t101","t102"].forEach(id => TASK_FAMILY[id] = "PIL");
// ESP1
["t53","t80","t81","t82","t83","t84","t85","t86","t87a","t88a","t89a","t92","E1-035","E1-036","E1-037","E1-038","E1-039","E1-040","E1-041","E1-042","E1-043","E1-044","E1-045","E1-046"].forEach(id => TASK_FAMILY[id] = "ESP1");
// OPS1
["E1-054","E1-055","E1-056","E1-057","E1-058","E1-059","E1-060","E1-061","E1-062","E1-063","E1-064","E1-065"].forEach(id => TASK_FAMILY[id] = "OPS1");
// ESP2
["E2-001","E2-002","E2-003","E2-004","E2-005","E2-006","E2-007"].forEach(id => TASK_FAMILY[id] = "ESP2");

// Stage overrides (manual)
const STAGE_OVERRIDES = {
  launch: ["t06","t07","t80","t83","t92","E1-040"],
  prod: ["t42","t55","t58","t60","t52","t53b","t53c","t114","E1-038"],
  pilot: ["t38","t98","t99","t100","t102"],
  post: ["t03","t04","t26","t27","t101","E1-061","E1-062"],
  pre: ["t91b","t116","E1-057","E2-003"],
};

// Flatten stage overrides to id -> stage
const STAGE_MAP = {};
for (const [stage, ids] of Object.entries(STAGE_OVERRIDES)) {
  ids.forEach(id => STAGE_MAP[id] = stage);
}

// Pillar overrides
const PILLAR_OVERRIDES = {
  "E2-004": "legal",
  "t80": "direccion",
};

// Space overrides for specific global tasks
const SPACE_OVERRIDES = {
  "t13": ["E1"], "t14": ["E1"], "t17": ["E1"], "t18": ["E1"], "t19": ["E1"], "t19b": ["E1"],
};

// =============================================
// STAGE INFERENCE by name patterns
// =============================================
function inferStage(id, name) {
  // Check explicit override first
  if (STAGE_MAP[id]) return STAGE_MAP[id];

  const n = name.toLowerCase();

  // Launch patterns
  if (/opening|lanzamiento|activar fase|certificado final|inauguraci/.test(n)) return "launch";

  // Post patterns
  if (/reporting|standup|weekly|ajustes post|feedback soft|analizar datos|manual operativo v[12]|suscripci|dashboard kpi|cashflow|control presupuesto/.test(n)) return "post";

  // Pilot patterns
  if (/piloto arranca|sesiones cortas|programa largo|test validaci|prototipo mvp|test kits|practica backup/.test(n)) return "pilot";

  // Production patterns
  if (/grabaci|edici.*modulos|subtitulos|videos en plataforma|qrs definitivos|pedido daruma|kits definitivos|merch producci|obra y acondicion|instalaci|montaje|produccion kits|produccion contenido|inicio reforma|inspecci|correcciones post|señaletica|equipamiento|sourcing av|sourcing mobiliario/.test(n)) return "prod";

  // Everything else = pre-production
  return "pre";
}

// =============================================
// TRANSFORM
// =============================================
function transformTask(raw) {
  const [id, name, ws, priority, endDate, owner, isMilestone, project, notes, status, startDate, risk] = raw;

  const familyCode = TASK_FAMILY[id];
  if (!familyCode) {
    console.warn(`WARNING: No family mapping for ${id} "${name}"`);
    return null;
  }

  const family = FAMILIES[familyCode];
  const isEpic = family.epicId === id;

  // Pillar (with overrides)
  const pillar = PILLAR_OVERRIDES[id] || family.pillar;

  // Stage
  const stage = inferStage(id, name);

  // Scope & Spaces
  let scope = family.scope;
  let spaces = [...family.spaces];

  // Apply space rules
  if (id.startsWith("E2-")) {
    spaces = ["E2"];
    scope = "space";
  } else if (id.startsWith("E1-")) {
    spaces = ["E1"];
    scope = "space";
  } else if (SPACE_OVERRIDES[id]) {
    spaces = SPACE_OVERRIDES[id];
    // Keep scope as family default (global tasks can be linked to a space)
  }

  return {
    id,
    name,
    status, // Already "Pendiente", "En curso", or "Hecho"
    priority, // Already P0-P3
    startDate,
    endDate,
    owner,
    risk,
    isMilestone,
    notes,
    family: familyCode,
    familyLabel: family.label,
    level: isEpic ? "epic" : "task",
    parent: isEpic ? null : family.epicId,
    pillar,
    stage,
    scope,
    spaces,
    milestone: family.milestone,
    deleted: false,
  };
}

// =============================================
// GENERATE OUTPUT
// =============================================
const allRaw = [...RAW, ...NEW_TASKS_RAW];
const enrichedTasks = allRaw.map(transformTask).filter(Boolean);

// Validate
const epicCount = enrichedTasks.filter(t => t.level === "epic").length;
const taskCount = enrichedTasks.filter(t => t.level === "task").length;
const families = new Set(enrichedTasks.map(t => t.family));

console.log(`\n=== GENERACION COMPLETADA ===`);
console.log(`Total tareas: ${enrichedTasks.length}`);
console.log(`Epics: ${epicCount}`);
console.log(`Tasks: ${taskCount}`);
console.log(`Familias: ${families.size} (${[...families].sort().join(", ")})`);
console.log(`\nPor familia:`);
for (const f of [...families].sort()) {
  const fTasks = enrichedTasks.filter(t => t.family === f);
  const epic = fTasks.find(t => t.level === "epic");
  console.log(`  ${f}: ${fTasks.length} tareas (epic: ${epic ? epic.id : 'MISSING!'})`);
}

// Stage distribution
console.log(`\nPor etapa:`);
for (const s of ["pre","prod","pilot","launch","post"]) {
  const count = enrichedTasks.filter(t => t.stage === s).length;
  console.log(`  ${s}: ${count}`);
}

// Write output
const output = `/**
 * NEO DMSTK - Tasks V2 (Enriched Data Model)
 * Generated: ${new Date().toISOString().split('T')[0]}
 * Total: ${enrichedTasks.length} tasks | ${epicCount} epics | ${taskCount} derived tasks
 * Families: ${families.size} | Merged WEB into TEC
 *
 * Data model fields:
 * - id, name, status, priority (P0-P3), startDate, endDate, owner, risk
 * - isMilestone, notes
 * - family (code), familyLabel (display name), level (epic|task), parent (epic ID or null)
 * - pillar, stage (pre|prod|pilot|launch|post), scope (global|space), spaces ([]), milestone
 * - deleted (boolean, soft delete)
 */

// =============================================
// FAMILIES DEFINITION
// =============================================
export const FAMILIES = {
  DIR: { code: "DIR", label: "Direccion & Decision", epicId: "t06", pillar: "direccion", milestone: "goNoGo", color: "#fbbf24" },
  LEG: { code: "LEG", label: "Legal & Licencias", epicId: "t13", pillar: "legal", milestone: "softOpeningE1", color: "#94a3b8" },
  MET: { code: "MET", label: "Metodo PERMA", epicId: "t20", pillar: "metodo", milestone: "piloto", color: "#a78bfa" },
  CON: { code: "CON", label: "Contenido Video", epicId: "t42", pillar: "contenido", milestone: "softOpeningE1", color: "#14b8a6" },
  DAR: { code: "DAR", label: "Daruma Ritual", epicId: "t50", pillar: "daruma", milestone: "piloto", color: "#f97316" },
  KIT: { code: "KIT", label: "Kits Experiencia", epicId: "t55", pillar: "kits", milestone: "piloto", color: "#eab308" },
  RET: { code: "RET", label: "Retail & Merch", epicId: "t60", pillar: "retail", milestone: "grandOpeningE1", color: "#a3a3a3" },
  BRA: { code: "BRA", label: "Marca & Branding", epicId: "t73", pillar: "branding", milestone: "piloto", color: "#ec4899" },
  RED: { code: "RED", label: "Redes & Marketing", epicId: "t75", pillar: "redes", milestone: "softOpeningE1", color: "#f472b6" },
  EQU: { code: "EQU", label: "Equipo & Formacion", epicId: "t91b", pillar: "equipo", milestone: "piloto", color: "#60a5fa" },
  TEC: { code: "TEC", label: "Tecnologia & Web", epicId: "t116", pillar: "tech", milestone: "softOpeningE1", color: "#34d399" },
  PIL: { code: "PIL", label: "Piloto & Validacion", epicId: "t102", pillar: "piloto", milestone: "goNoGo", color: "#ef4444" },
  ESP1: { code: "ESP1", label: "Espacio E1 Madrid", epicId: "t92", pillar: "espacio", milestone: "reformaE1", color: "#fb923c" },
  OPS1: { code: "OPS1", label: "Operaciones E1", epicId: "E1-057", pillar: "ops", milestone: "softOpeningE1", color: "#818cf8" },
  ESP2: { code: "ESP2", label: "E2 Barcelona", epicId: "E2-003", pillar: "espacio", milestone: "softOpeningE2", color: "#10b981" },
};

// =============================================
// PILLARS
// =============================================
export const PILLARS = {
  direccion:  { key: "direccion",  label: "Direccion",        color: "#fbbf24" },
  legal:      { key: "legal",      label: "Legal",            color: "#94a3b8" },
  metodo:     { key: "metodo",     label: "Metodo",           color: "#a78bfa" },
  contenido:  { key: "contenido",  label: "Contenido Video",  color: "#14b8a6" },
  daruma:     { key: "daruma",     label: "Daruma",           color: "#f97316" },
  kits:       { key: "kits",       label: "Kits",             color: "#eab308" },
  retail:     { key: "retail",     label: "Retail & Merch",   color: "#a3a3a3" },
  branding:   { key: "branding",   label: "Branding",         color: "#ec4899" },
  redes:      { key: "redes",      label: "Redes & Mktg",     color: "#f472b6" },
  equipo:     { key: "equipo",     label: "Equipo",           color: "#60a5fa" },
  tech:       { key: "tech",       label: "Tecnologia",       color: "#34d399" },
  piloto:     { key: "piloto",     label: "Piloto",           color: "#ef4444" },
  espacio:    { key: "espacio",    label: "Espacio Fisico",   color: "#fb923c" },
  ops:        { key: "ops",        label: "Operaciones",      color: "#818cf8" },
};

// =============================================
// STAGES
// =============================================
export const STAGES = {
  pre:    { key: "pre",    label: "Pre-produccion", color: "#64748b" },
  prod:   { key: "prod",   label: "Produccion",     color: "#f59e0b" },
  pilot:  { key: "pilot",  label: "Piloto",         color: "#8b5cf6" },
  launch: { key: "launch", label: "Lanzamiento",    color: "#10b981" },
  post:   { key: "post",   label: "Post / Ops",     color: "#3b82f6" },
};

// =============================================
// MILESTONES
// =============================================
export const MILESTONES = {
  piloto:         { key: "piloto",         label: "Piloto arranca",         date: "2026-05-19", color: "#8b5cf6" },
  goNoGo:         { key: "goNoGo",         label: "GO/NO-GO Board",        date: "2026-06-20", color: "#e74c3c" },
  reformaE1:      { key: "reformaE1",      label: "Reforma E1 (PB+P1)",    date: "2026-06-25", color: "#f97316" },
  softOpeningE1:  { key: "softOpeningE1",  label: "Soft Opening E1",       date: "2026-09-01", color: "#10b981" },
  grandOpeningE1: { key: "grandOpeningE1", label: "Grand Opening E1",      date: "2026-10-01", color: "#3b82f6" },
  softOpeningE2:  { key: "softOpeningE2",  label: "Soft Opening E2",       date: "2026-11-21", color: "#10b981" },
};

// =============================================
// TASKS DATA
// =============================================
export const TASKS_V2 = ${JSON.stringify(enrichedTasks, null, 2)};

// =============================================
// HELPERS
// =============================================
export function getEpicTasks(familyCode) {
  return TASKS_V2.filter(t => t.family === familyCode && t.level === "task");
}

export function getEpic(familyCode) {
  return TASKS_V2.find(t => t.family === familyCode && t.level === "epic");
}

export function getTasksByPillar(pillarKey) {
  return TASKS_V2.filter(t => t.pillar === pillarKey);
}

export function getTasksByStage(stageKey) {
  return TASKS_V2.filter(t => t.stage === stageKey);
}

export function getTasksByMilestone(milestoneKey) {
  return TASKS_V2.filter(t => t.milestone === milestoneKey);
}

export function getTasksByScope(scope, space) {
  if (scope === "global") return TASKS_V2.filter(t => t.scope === "global");
  return TASKS_V2.filter(t => t.spaces.includes(space));
}
`;

import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = __dirname + '/tasks-v2.js';
writeFileSync(outputPath, output, 'utf-8');
console.log(`\nArchivo generado: ${outputPath}`);
console.log(`Tamano: ${(output.length / 1024).toFixed(1)} KB`);
