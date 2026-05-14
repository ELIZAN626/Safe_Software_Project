

# SCA (Software Composition Analysis)

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

1. Abrir una terminal dentro del proyecto.
2. Ejecutar el siguiente comando:

```bash id="c7rk4d"
npm audit
```

3. Esperar a que la herramienta analice las dependencias instaladas.
4. Revisar el reporte generado.

---

## Resultados obtenidos

La herramienta identificó 0 vulnerabilidades

---

## Interpretación de resultados

Las vulnerabilidades detectadas indican que, al menos en el aspecto de la estructura del código del proyecto, nos encontramos en buen camino.

---

## Recomendaciones

* Seguir así.

---

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

```bash id="lf93tg"
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

```text id="o5u5ij"
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

```gitignore id="dhn5my"
*.pem
*.key
.env
```

---

## Conclusión

La prueba de Secret Scanning permitió detectar exitosamente información sensible expuesta dentro del repositorio del proyecto. El hallazgo demuestra la importancia de integrar controles automáticos de seguridad dentro del ciclo de desarrollo seguro (DevSecOps), especialmente para prevenir la exposición accidental de credenciales y secretos en repositorios de código.
