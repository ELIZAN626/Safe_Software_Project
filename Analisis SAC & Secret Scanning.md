
# Reporte — SCA (Software Composition Analysis)

## Objetivo

El objetivo de esta prueba fue identificar vulnerabilidades presentes en las dependencias y librerías de terceros utilizadas por la aplicación, con el fin de detectar componentes inseguros o desactualizados que pudieran comprometer la seguridad del sistema.

La prueba se realizó como parte de las actividades de seguridad de la cadena de suministro (Supply Chain Security), las cuales son relevantes dentro del enfoque DevSecOps visto en clase. 

---

## Herramienta utilizada

Para realizar el análisis SCA se utilizó:

* `npm audit`

Esta herramienta permite analizar automáticamente las dependencias instaladas en proyectos Node.js y detectar vulnerabilidades conocidas reportadas en la base de datos de npm.

---

## Procedimiento

1. Se abrió una terminal dentro de la carpeta raíz del proyecto.
2. Se ejecutó el siguiente comando:

```bash id="g0vl5n"
npm audit
```

3. La herramienta realizó el análisis de todas las dependencias instaladas en el proyecto.
4. Se revisó el reporte generado automáticamente por npm.

---

## Resultados obtenidos

El análisis SCA realizado con `npm audit` no detectó vulnerabilidades en las dependencias utilizadas por el proyecto.

Resultado obtenido:

```text id="vbyv47"
found 0 vulnerabilities
```

La herramienta verificó correctamente las librerías instaladas y no encontró paquetes con vulnerabilidades conocidas reportadas al momento de ejecutar el análisis.

---

## Interpretación de resultados

Los resultados indican que las dependencias utilizadas actualmente por la aplicación no presentan vulnerabilidades conocidas registradas dentro de la base de datos de seguridad de npm.

Esto reduce el riesgo asociado a ataques de cadena de suministro (Supply Chain Attacks), vulnerabilidades transitivas y explotación de librerías inseguras, temas abordados durante el curso. 

Sin embargo, debido a que continuamente aparecen nuevas vulnerabilidades en paquetes de terceros, es importante mantener monitoreo constante sobre las dependencias del proyecto.

---

## Recomendaciones

* Continuar realizando análisis periódicos de dependencias.
* Mantener las librerías actualizadas.
* Integrar análisis SCA automatizado dentro del pipeline CI/CD.
* Revisar regularmente nuevas vulnerabilidades publicadas para paquetes utilizados en el proyecto.
* Evitar instalar dependencias innecesarias o sin mantenimiento.

---

## Conclusión

La prueba SCA permitió validar que las dependencias actuales del proyecto no presentan vulnerabilidades conocidas al momento del análisis. Esto contribuye a mejorar la seguridad del software y reducir riesgos relacionados con componentes de terceros y ataques a la cadena de suministro.


```sh
npm audit
```

3. La herramienta realizó el análisis de todas las dependencias instaladas en el proyecto.
4. Se revisó el reporte generado automáticamente por npm.

---

## Resultados obtenidos

El análisis SCA realizado con `npm audit` no detectó vulnerabilidades en las dependencias utilizadas por el proyecto.

Resultado obtenido:

```text
found 0 vulnerabilities
```

La herramienta verificó correctamente las librerías instaladas y no encontró paquetes con vulnerabilidades conocidas reportadas al momento de ejecutar el análisis.

---

## Interpretación de resultados

Los resultados indican que las dependencias utilizadas actualmente por la aplicación no presentan vulnerabilidades conocidas registradas dentro de la base de datos de seguridad de npm.

Esto reduce el riesgo asociado a ataques de cadena de suministro (Supply Chain Attacks), vulnerabilidades transitivas y explotación de librerías inseguras, temas abordados durante el curso. 

Sin embargo, debido a que continuamente aparecen nuevas vulnerabilidades en paquetes de terceros, es importante mantener monitoreo constante sobre las dependencias del proyecto.

---

## Recomendaciones

* Continuar realizando análisis periódicos de dependencias.
* Mantener las librerías actualizadas.
* Integrar análisis SCA automatizado dentro del pipeline CI/CD.
* Revisar regularmente nuevas vulnerabilidades publicadas para paquetes utilizados en el proyecto.
* Evitar instalar dependencias innecesarias o sin mantenimiento.

---

## Conclusión

La prueba SCA permitió validar que las dependencias actuales del proyecto no presentan vulnerabilidades conocidas al momento del análisis. Esto contribuye a mejorar la seguridad del software y reducir riesgos relacionados con componentes de terceros y ataques a la cadena de suministro.

 
# Reporte — Secret Scanning

## Objetivo

El objetivo de esta prueba fue identificar posibles secretos expuestos dentro del repositorio del proyecto, tales como:

* contraseñas
* API Keys
* tokens
* credenciales
* llaves privadas
* secretos hardcodeados

Este análisis busca prevenir filtraciones de información sensible y accesos no autorizados mediante la detección temprana de credenciales expuestas dentro del código fuente y del historial de commits.

---

## Herramienta utilizada

Se utilizó la herramienta:

* `Gitleaks`

Gitleaks permite detectar secretos expuestos tanto en archivos actuales del proyecto como en commits anteriores del repositorio Git.

---

## Procedimiento

1. Se abrió una terminal dentro de la carpeta raíz del proyecto.
2. Se ejecutó el análisis utilizando Docker y Gitleaks con el siguiente comando:

```sh
docker run --rm -v $(pwd):/path zricethezav/gitleaks detect --source="/path" -v
```

3. La herramienta analizó el repositorio completo y el historial de commits.
4. Se revisaron los hallazgos encontrados y su nivel de riesgo.

---

## Resultados obtenidos

Durante el análisis se detectó un secreto expuesto dentro del repositorio.

Hallazgo detectado:

| Campo              | Resultado           |
| ------------------ | ------------------- |
| Tipo de hallazgo   | Private Key         |
| Rule ID            | `private-key`       |
| Archivo afectado   | `BACKEND/key.pem`   |
| Línea detectada    | 1                   |
| Commits analizados | 67                  |
| Tamaño analizado   | 18.51 MB            |
| Resultado final    | 1 secreto detectado |

La herramienta identificó una llave privada almacenada directamente dentro del repositorio del proyecto.

Fragmento del resultado obtenido:

```text
Finding: -----BEGIN PRIVATE KEY-----
RuleID: private-key
File: BACKEND/key.pem
Line: 1
WRN leaks found: 1
```

---

## Interpretación de resultados

La exposición de una llave privada representa una vulnerabilidad crítica de seguridad, ya que este tipo de credenciales puede ser utilizado para:

* comprometer mecanismos de autenticación
* falsificar identidades
* acceder a servicios protegidos
* comprometer conexiones seguras
* realizar ataques sobre la infraestructura

Además, debido a que el secreto fue encontrado dentro del historial de commits, el riesgo persiste incluso si el archivo es eliminado posteriormente del repositorio actual.

Este tipo de hallazgo se relaciona directamente con los riesgos de exposición de secretos y malas prácticas de gestión de credenciales vistos durante el curso. 

---

## Recomendaciones

* Eliminar inmediatamente la llave privada del repositorio.
* Regenerar o rotar la credencial comprometida.
* Evitar almacenar archivos `.pem` dentro del código fuente.
* Utilizar variables de entorno o gestores de secretos.
* Configurar correctamente el archivo `.gitignore`.
* Implementar Secret Scanning automatizado dentro del pipeline CI/CD.
* Limpiar el historial del repositorio para remover secretos previamente expuestos.

Ejemplo de configuración recomendada para `.gitignore`:

```gitignore
*.pem
*.key
.env
```

---

## Conclusión

La prueba de Secret Scanning permitió detectar exitosamente información sensible expuesta dentro del repositorio del proyecto. El hallazgo demuestra la importancia de integrar controles automáticos de seguridad dentro del ciclo de desarrollo seguro (DevSecOps), especialmente para prevenir la exposición accidental de credenciales y secretos en repositorios de código.


