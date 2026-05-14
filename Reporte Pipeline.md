
# Reporte Pipeline de Seguridad CI/CD

## Objetivo

El objetivo del pipeline fue integrar controles automáticos de seguridad dentro del proceso CI/CD, permitiendo ejecutar análisis de seguridad automáticamente cada vez que se realizan cambios en el repositorio.

Esto sigue el enfoque DevSecOps visto durante el curso, integrando seguridad dentro del ciclo de desarrollo y despliegue continuo. 

---

# Herramientas integradas

| Control         | Herramienta    |
| --------------- | -------------- |
| SCA             | npm audit      |
| Secret Scanning | Gitleaks       |
| SAST            | Semgrep        |
| CI/CD           | GitHub Actions |

---

# Funcionamiento del pipeline

El pipeline se ejecuta automáticamente al realizar un `push` al repositorio.

Las etapas implementadas fueron:

1. Checkout del código fuente
2. Instalación de dependencias
3. Análisis SCA con npm audit
4. Secret Scanning con Gitleaks
5. Análisis SAST con Semgrep

---

# Beneficios obtenidos

* Automatización de pruebas de seguridad
* Detección temprana de vulnerabilidades
* Prevención de exposición de secretos
* Integración de seguridad en el flujo de desarrollo
* Validación continua del código

