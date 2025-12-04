export interface Simulador {
  id: string;
  nombre: string;
  frase_gancho: string;
  stakeholders_clave: string[];
  dolor_que_muestra: string;
  promesa_visual: string;
  metricas_clave: string[];
  prompts: {
    es: string;
    en: string;
  };
}

export const simuladores: Simulador[] = [
  {
    id: "cartera_recurrente",
    nombre: "Cartera Recurrente · ISPs y servicios por suscripción",
    frase_gancho: "De Excel caótico a tablero de morosidad bajo control.",
    stakeholders_clave: [
      "Dueños de ISP regionales",
      "Responsables de cobranzas",
      "COO / Directores de Operaciones",
      "Inversores interesados en ARPU y churn",
    ],
    dolor_que_muestra:
      "No saben cuántos clientes pagan en tiempo, cuánta plata está trabada en morosidad ni qué segmento se está cayendo mes a mes.",
    promesa_visual:
      "Un tablero donde en 3 segundos se ve: salud de la cartera, morosidad, churn y oportunidades de recupero.",
    metricas_clave: [
      "Clientes totales / activos / morosos",
      "Tasa de cobranza (mes actual vs histórico)",
      "Churn mensual y trimestral",
      "Recupero de morosos (winback)",
      "MRR estimado y MRR en riesgo",
      "Distribución por plan / segmento",
    ],
    prompts: {
      es: "Diseña un panel de simulación llamado 'Cartera Recurrente · ISPs y servicios por suscripción' para Nordia. El objetivo es cautivar a dueños de ISPs regionales, responsables de cobranzas e inversores. El tablero debe mostrar el antes (caos, falta de visibilidad) y el después (claridad brutal). Incluye KPIs grandes: Clientes Totales, Clientes Activos, Clientes Morosos, Tasa de Cobranza, Churn, MRR estimado y MRR en riesgo. Agrega gráficos de barras y líneas que comparen morosidad por segmento y evolución de cobranza en 6–12 meses. Estilo visual: corporativo, sobrio, con fondo claro, bloques bien separados y tipografía limpia. Marca explícitamente que son 'DATOS SIMULADOS basados en problemas reales'. Añade un texto corto que diga: 'Si tuvieras este tablero hoy, ¿qué decisión tomarías primero?' y un botón de CTA: 'Quiero ver mi cartera así'.",
      en: "Design a simulation panel called 'Recurring Revenue Portfolio · ISPs & Subscription Services' for Nordia. The goal is to impress regional ISP owners, heads of collections and investors. The dashboard should contrast BEFORE (chaos, no visibility) and AFTER (brutal clarity). Include big KPIs: Total Customers, Active Customers, Delinquent Customers, Collection Rate, Monthly Churn, Estimated MRR and At-Risk MRR. Use bar and line charts to show delinquency by segment and collection trends over 6–12 months. Visual style: corporate, clean, light background, well-separated cards and modern typography. Clearly label: 'SIMULATED DATA based on real problems'. Add a short copy line: 'If you had this dashboard today, what would you fix first?' plus a CTA button: 'I want my portfolio to look like this'.",
    },
  },
  {
    id: "pos_retail",
    nombre: "POS Inteligente · Retail y negocios de cercanía",
    frase_gancho: "Tu caja ya sabe la verdad del negocio, solo hay que escucharla.",
    stakeholders_clave: [
      "Dueños de carnicerías, verdulerías, minimercados",
      "Responsables de compras y stock",
      "Inversores mirando ticket promedio y margen",
    ],
    dolor_que_muestra:
      "Venden mucho pero no saben si realmente ganan plata, qué productos sostienen el margen ni qué combos podrían armar.",
    promesa_visual:
      "Un panel que convierte el POS en un sensor del negocio: ventas, ticket promedio, rotación y margen, todo en una sola vista.",
    metricas_clave: [
      "Ventas del mes y comparativo con mes anterior",
      "Tickets del mes y ticket promedio",
      "Top productos por unidades y facturación",
      "Margen bruto estimado",
      "Rotación de categorías (alta / media / baja)",
      "Productos en 'zona roja' (poco margen / poca rotación)",
    ],
    prompts: {
      es: "Diseña un simulador visual 'POS Inteligente · Retail y negocios de cercanía' para Nordia. Debe sentirse como el tablero soñado de una carnicería o minimarket serio. Muestra una tarjeta principal con Ventas del Mes, Tickets Totales y Ticket Promedio. Agrega un gráfico de barras con los 'Top 5 productos' por unidades vendidas y otro por facturación, marcando con color sutil los de mejor margen. Incluye indicadores de Margen Bruto estimado y una sección de 'Zona Roja', listando productos con baja rotación o margen débil. Estilo: limpio, sin ruidos, con énfasis en lo accionable. Añade un texto corto: 'Tu POS ya sabe qué productos sostienen tu negocio. Este panel te lo traduce en decisiones.' y un CTA: 'Quiero un POS que piense así'. Marca como 'MODO DEMO – DATOS SIMULADOS'.",
      en: "Design a visual simulator called 'Smart POS · Retail & Local Stores' for Nordia. It should feel like the dream dashboard for a serious butcher shop or convenience store. Show a main hero card with Monthly Sales, Total Tickets and Average Ticket. Add bar charts for 'Top 5 products' by units sold and by revenue, subtly highlighting those with better margins. Include indicators for Estimated Gross Margin and a 'Red Zone' listing products with low rotation or weak margin. Style: clean, focused on decisions. Add a copy line: 'Your POS already knows which products keep you alive. This panel turns that into decisions.' plus a CTA: 'I want a POS that thinks like this'. Flag it clearly as 'DEMO MODE – SIMULATED DATA'.",
    },
  },
  {
    id: "ultima_milla",
    nombre: "Última Milla · Cobertura, SLA y rentabilidad por zona",
    frase_gancho: "No es solo 'mandar motos', es gobernar la ciudad.",
    stakeholders_clave: [
      "Telcos y proveedores de conectividad que quieren última milla",
      "Empresas de mensajería urbana",
      "Inversores interesados en densidad de demanda y unit economics",
    ],
    dolor_que_muestra:
      "Muchos vehículos en la calle pero poca claridad sobre capacidad real, zonas rentables, SLA y costos por envío.",
    promesa_visual:
      "Un panel que convierte la ciudad en un tablero táctico: cobertura, tiempos de entrega, saturación y rentabilidad por zona.",
    metricas_clave: [
      "Pedidos por día y por franja horaria",
      "Tiempo medio de entrega (SLA) y % órdenes en tiempo",
      "Zonas activas vs zonas con potencial",
      "Capacidad instalada (motos/vehículos) vs capacidad utilizada",
      "Costo promedio por envío y margen por zona",
      "Tasa de pedidos con fricción (reclamos, reintentos)",
    ],
    prompts: {
      es: "Crea un simulador visual llamado 'Última Milla · Cobertura, SLA y rentabilidad por zona' para Nordia. Debe seducir a un Telco o a una empresa de mensajería que quiere escalar. En el centro, un mapa estilizado de ciudad con zonas coloreadas según rentabilidad o SLA (verde, amarillo, rojo). Al costado, KPIs grandes: Pedidos Hoy, Tiempo Medio de Entrega, % Pedidos en Tiempo, Vehículos Activos, Costo Promedio por Envío. Agrega gráficos simples que muestren pedidos por franja horaria y capacidad utilizada vs capacidad disponible. El diseño debe transmitir control y posibilidad de expansión: 'Si agrego 3 vehículos más en esta zona, ¿qué impacto tengo?'. Añade un texto: 'La ciudad es tu tablero. Este panel te muestra dónde ganar en serio.' y un CTA: 'Quiero simular mi última milla así'. Etiqueta claramente 'MODO DEMO – DATOS FICTICIOS, ESCENARIOS REALES'.",
      en: "Create a visual simulator called 'Last Mile · Coverage, SLA & Profitability by Zone' for Nordia. It must appeal to a Telco or an urban delivery operator planning to scale. At the center, a stylized city map with zones colored by profitability or SLA (green, yellow, red). On the side, big KPIs: Orders Today, Average Delivery Time, % On-time Orders, Active Vehicles, Average Cost per Delivery. Include simple charts showing orders by time of day and utilized vs available capacity. The design should convey control and expansion potential: 'If I add 3 more vehicles here, what happens?'. Add the copy: 'The city is your board. This panel shows where you actually win.' and a CTA: 'I want to simulate my last mile like this'. Clearly label: 'DEMO MODE – FICTIONAL DATA, REAL SCENARIOS'.",
    },
  },
  {
    id: "operacion_combinada",
    nombre: "Operación Combinada · Suscripciones + POS + Delivery",
    frase_gancho: "Cuando tu negocio es híbrido, tu tablero también tiene que serlo.",
    stakeholders_clave: [
      "Pymes que mezclan servicio recurrente con mostrador y envíos",
      "Directores financieros de grupos pequeños",
      "Inversores que quieren ver la película completa del flujo de caja",
    ],
    dolor_que_muestra:
      "Cada unidad de negocio se mide con un sistema distinto; nadie ve el negocio como un todo ni el flujo de caja real.",
    promesa_visual:
      "Un cockpit único que muestra cómo interactúan suscripciones, ventas POS y delivery en margen y caja.",
    metricas_clave: [
      "Ingresos recurrentes mensuales (MRR)",
      "Ventas POS mensuales",
      "Ingresos por delivery",
      "Margen operativo combinado",
      "Clientes únicos totales vs por canal",
      "Flujo de caja proyectado 30–90 días",
    ],
    prompts: {
      es: "Diseña un simulador visual 'Operación Combinada · Suscripciones + POS + Delivery' para Nordia. La interfaz debe sentirse como un cockpit de avión para una pyme híbrida. Divide el panel en tres columnas resumidas: Suscripciones, POS, Delivery, cada una con sus KPIs principales. Encima, una franja de 'Foto Global' con Ingresos Totales, Margen Operativo, Clientes Únicos y Caja Proyectada a 30 días. Añade un gráfico que muestre la contribución porcentual de cada canal y otro que muestre la evolución conjunta de ingresos en el tiempo. El mensaje debe ser: 'No importa por dónde entra la plata, acá ves si el negocio realmente gana.' Incluye un CTA: 'Quiero un cockpit único para mi operación'. Señala que es un escenario simulado pero basado en casos reales.",
      en: "Design a visual simulator called 'Combined Operation · Subscriptions + POS + Delivery' for Nordia. The UI should feel like an airplane cockpit for a hybrid SME. Split the panel into three condensed columns: Subscriptions, POS and Delivery, each with its key KPIs. On top, a 'Global Picture' bar with Total Revenue, Operating Margin, Unique Customers and 30-day Cash Projection. Add a chart showing each channel's contribution to revenue and another one showing total revenue evolution over time. The message: 'No matter where money comes from, here you see if the business actually wins.' Add a CTA: 'I want a single cockpit for my operation'. Make it clear it's a simulated scenario based on real-world patterns.",
    },
  },
  {
    id: "ia_operativa",
    nombre: "Cobertura de IA Operativa · De tareas a agentes",
    frase_gancho: "Cuánta operación todavía estás haciendo a mano y no deberías.",
    stakeholders_clave: [
      "Dueños de pymes con backoffice sobrecargado",
      "COO que sienten que 'todo depende de personas clave'",
      "Inversores que quieren ver escalabilidad sin crecer en headcount",
    ],
    dolor_que_muestra:
      "Demasiadas tareas repetitivas hechas a mano, mucha dependencia de personas clave y poca automatización de bajo riesgo.",
    promesa_visual:
      "Un mapa de tareas operativas y su grado de automatización actual y potencial, para pensar en agentes de IA como colaboradores.",
    metricas_clave: [
      "% de tareas repetitivas automatizables",
      "% de tareas críticas que dependen de 1 persona",
      "Horas hombre mensuales en tareas de bajo valor",
      "Ahorro potencial estimado (horas / costo)",
      "Cantidad de 'agentes IA' posibles por área",
    ],
    prompts: {
      es: "Crea un simulador llamado 'Cobertura de IA Operativa · De tareas a agentes' para Nordia. Este panel no muestra ventas, muestra trabajo: tareas, horas y dependencia de personas. Diseña bloques por área (Cobranza, Atención al cliente, Operaciones, Administración) y dentro de cada bloque, una barra que indique qué porcentaje de tareas ya está automatizado, cuál podría automatizarse y cuál debe seguir siendo humano. Incluye indicadores globales: Horas hombre mensuales en tareas repetitivas, Ahorro potencial estimado en horas y en dinero, Número de agentes IA potenciales (por ejemplo: 'Agente de cobranza preventiva', 'Agente de seguimiento de pedidos'). El estilo debe invitar a pensar: 'Si este panel fuera real, ¿qué agente IA construiríamos primero?'. Añade un CTA: 'Quiero mapear mi operación para agentes IA'.",
      en: "Create a simulator called 'Operational AI Coverage · From Tasks to Agents' for Nordia. This dashboard doesn't show sales; it shows work: tasks, hours and human dependency. Design area blocks (Collections, Customer Support, Operations, Admin) and inside each block a bar indicating which % of tasks is already automated, which % could be automated and which must stay human. Include global indicators: Monthly human-hours on repetitive tasks, potential savings (hours and cost), and number of potential AI agents (e.g. 'Preventive Collections Agent', 'Order Follow-up Agent'). The style should make people think: 'If this dashboard were real, which AI agent would we build first?'. Add a CTA: 'I want to map my operation for AI agents'.",
    },
  },
];
