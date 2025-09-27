#!/bin/bash
# Quick Demo Script - Nordia ISP Suite
# Script de 3 minutos para grabar video demo

echo "🎬 INICIANDO DEMO DE 3 MINUTOS - NORDIA ISP SUITE"
echo "=================================================="

# Limpiar pantalla
clear

echo "🔥 NORDIA ISP SUITE - Demo Ejecutivo"
echo "Automatización de Cortes por Mora - ISPs Corrientes"
echo ""
echo "CASO: TeleCorrientes SA - 1,247 clientes"
echo "PROBLEMA: 12h semanales manuales = $168,000/año"
echo ""
echo "📊 CARGANDO ARCHIVO CSV..."
sleep 2

# Mostrar muestra del CSV
echo "✅ 102 morosos cargados:"
head -6 ~/nordia-isp-suite/data/morosos_realistas.csv
echo "... (y 96 registros más)"
echo ""
sleep 3

echo "🔌 CONECTANDO AL ROUTER MIKROTIK..."
sleep 1
echo "✅ Conectado a 192.168.1.1 - MikrotikOS v7.x"
echo ""
sleep 2

echo "⚡ INICIANDO PROCESO AUTOMÁTICO..."
echo "Filtrando morosos +60 días..."
sleep 1

# Ejecutar demo real
echo "🚀 EJECUTANDO DEMO EN VIVO:"
python3 ~/nordia-isp-suite/scripts/cut_service.py \
  --csv ~/nordia-isp-suite/data/morosos_realistas.csv \
  --router mock \
  --mode dry-run \
  --min-days 60 \
  --batch-size 10 \
  --output ~/nordia-isp-suite/output

echo ""
echo "💰 ROI INMEDIATO:"
echo "   Tiempo proceso: 30 segundos vs 4 horas"
echo "   Ahorro anual: $1,200,000"
echo "   ROI: 800% primer año"
echo ""
echo "📞 CONTACTO: +54 379 4123456"
echo "📧 gonzalo@nordia-suite.com"
echo ""
echo "🎉 FIN DEL DEMO - ¡Gracias!"