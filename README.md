# StockControl — Gestion de Productos y Stock

StockControl es una aplicacion frontend demostrativa para la gestion de productos e inventario de pequenos comercios.

El proyecto utiliza una libreria ficticia como ejemplo y permite simular distintas operaciones de gestion de stock mediante una interfaz sencilla, moderna y responsive.

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- CSS
- Context API de React
- Git y GitHub

## Funcionalidades implementadas

**Inicio**
- Visualizacion de productos con stock bajo o agotados.
- Listado de los ultimos movimientos de mercaderia.

**Productos**
- Listado y busqueda de productos.
- Filtros por categoria y estado del stock.
- Alta de productos mediante formularios.
- Edicion de productos existentes.
- Eliminacion con confirmacion.
- Validaciones de datos y codigos duplicados.

**Movimientos**
- Registro de entradas y salidas de mercaderia.
- Actualizacion automatica del stock.
- Validacion para evitar cantidades negativas o salidas superiores al stock disponible.
- Historial de movimientos realizados.

## Funcionamiento

La aplicacion utiliza datos ficticios y administra la informacion mediante el estado de React y Context API.

No requiere backend ni base de datos. Los cambios funcionan durante la sesion, pero se reinician al recargar la pagina.

## Ejecutar el proyecto

Requisitos: Node.js y npm.

1. Clonar el repositorio.
2. Instalar las dependencias:

```bash
npm install
```

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

4. Abrir la direccion local que muestra Vite.

## Estado del proyecto

En desarrollo.

Proximas funcionalidades:
- Gestion de categorias.
- Pantalla de alertas de stock.
- Mejoras visuales y responsive.

## Objetivo

Este proyecto forma parte de mi portfolio como desarrollador y busca demostrar una interfaz de gestion comercial que pueda adaptarse a las necesidades de distintos negocios.

En una futura implementacion para clientes, el frontend podria integrarse con una API REST desarrollada con Java, Spring Boot y MySQL.