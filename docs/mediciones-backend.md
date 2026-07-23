# Backend - Optimización de Importación de Mediciones

*(Nota: Esta documentación refleja el diseño propuesto para escalar el rendimiento. Su implementación quedará pendiente hasta terminar la refactorización del frontend).*

## 1. Problema Actual: Validación de Duplicados Ineficiente
Actualmente, durante la validación de un lote de importación masivo, el backend chequea si existen registros duplicados ejecutando una consulta SQL masiva cargada de cláusulas `OR`. 
Se construye iterativamente una consulta gigante del tipo:
`Q(limnigrafo_id=X, fecha_hora=Y) | Q(limnigrafo_id=X, fecha_hora=Z)...`
Para importaciones de meses de datos (miles de registros), el motor de base de datos se sobrecarga armando el plan de ejecución para cientos o miles de sentencias lógicas concatenadas.

## 2. Estrategia de Búsqueda por Rango Temporal
El comportamiento habitual de los sensores (o de archivos importados) dicta que las mediciones se agrupan en un flujo de tiempo continuo o dentro de un rango temporal específico. Aprovecharemos esta secuencialidad.

**Flujo de la Optimización:**
1. **Calcular Min/Max Temporal:** Al recibir el array de objetos a validar en el endpoint, el backend extrae localmente la fecha/hora mínima y máxima de toda la muestra.
2. **Consulta Acotada y Unificada:** Ejecutar una consulta optimizada a la tabla de base de datos pidiendo **únicamente la columna `fecha_hora`** que se encuentre dentro de ese período:
   ```sql
   SELECT fecha_hora FROM mediciones 
   WHERE limnigrafo_id = ? 
   AND fecha_hora BETWEEN [min_fecha] AND [max_fecha]
   ```
3. **Mapeo en Memoria en Tiempo Constante $O(1)$:** Transformar esa lista pequeña de fechas históricas en un `Set` dentro de Python para aprovechar la eficiencia de la estructura Hash.
4. **Validación Instantánea:** Al iterar luego fila por fila sobre el payload para calcular los `duplicate_database`, basta con chequear:
   ```python
   if row["fecha_hora"] in db_dates_set:
       # Es un duplicado
   ```

Esta arquitectura reduce la complejidad exponencial en base de datos a un lookup estático de alto rendimiento, asegurando latencias bajísimas independientemente del tamaño de la importación.
