# UML Flow - Editor Colaborativo UML

Este módulo proporciona una implementación completamente nueva del editor UML utilizando React Flow como base para una experiencia de diagramación más fluida y colaborativa.

## Características principales

- **Editor intuitivo**: Arrastrar y soltar para mover elementos, crear conexiones fácilmente
- **Colaboración en tiempo real**: Sesiones colaborativas con WebSockets
- **UI mejorada**: Interfaz más limpia y mejor experiencia de usuario
- **Personalización completa**: Edición de clases, interfaces, métodos y atributos
- **Relaciones UML**: Soporte para todos los tipos de relaciones UML estándar

## Componentes principales

- `UMLFlowEditor.tsx`: Componente principal que integra React Flow con el sistema de colaboración
- `nodes/`: Implementaciones de los diferentes tipos de nodos UML (clases, interfaces, etc.)
- `edges/`: Implementación de las relaciones entre nodos
- `styles/`: Estilos CSS específicos para el editor

## Cómo usar

El editor se utiliza automáticamente en la ruta `/dashboard/uml-designer` y permite:

1. **Crear elementos**: Selecciona el tipo de elemento desde la barra de herramientas y haz clic en el lienzo
2. **Editar propiedades**: Selecciona un elemento para editar sus propiedades en el panel lateral
3. **Crear relaciones**: Arrastra desde los puntos de conexión para crear relaciones
4. **Colaborar**: Inicia sesiones colaborativas con otros usuarios

## Mejoras respecto a la versión anterior

- Rendimiento más fluido y responsive
- Mejor manejo de la colaboración en tiempo real
- Interfaz más intuitiva con feedback visual
- Edición más sencilla de propiedades
- Sistema de guardado automático
- Mejor manejo de la selección y movimiento de elementos

## Tecnologías

- React Flow para la diagramación
- WebSockets para colaboración en tiempo real
- React y TypeScript para la implementación
- Tailwind CSS para los estilos

## Recomendaciones

Para obtener la mejor experiencia, se recomienda:

1. Usar un navegador actualizado (Chrome, Firefox, Edge)
2. Mantener una conexión estable para colaboración
3. Guardar regularmente los cambios
