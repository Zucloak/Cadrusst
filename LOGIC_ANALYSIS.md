# FreeCAD Core Logic Analysis

This document outlines the core logic of FreeCAD extracted from the source code (`src/Base`, `src/App`, `src/Mod/Part`). This analysis serves as the foundation for creating a Rust-powered core wrapped in WASM.

## 1. Base Layer (`src/Base`)

The `Base` module provides the foundational types and utilities used throughout the application.

*   **Math & Geometry Primitives**:
    *   `Vector3D`: 3D vector operations (add, sub, cross, dot, normalize).
    *   `Matrix4D`: 4x4 Transformation matrices.
    *   `Placement`: Represents a position and orientation (Rotation + Translation). This is crucial for positioning objects in 3D space.
    *   `Rotation`: Quaternion-based or Axis-Angle rotation logic.
    *   `BoundBox`: Axis-aligned bounding box for geometry.
*   **Type System**:
    *   `Type`: A runtime type information (RTTI) system. FreeCAD uses its own RTTI to handle the complex inheritance hierarchy of objects and properties.
    *   `BaseClass`: The root of the inheritance hierarchy.
    *   `Persistence`: Interface for objects that can be saved/restored (serialization).
*   **Units & Quantities**:
    *   `Unit`: Handling of physical units (mm, kg, s, etc.).
    *   `Quantity`: Value + Unit (e.g., "10 mm").
*   **System Utilities**:
    *   `Console`: Logging and error reporting.
    *   `Interpreter`: Python interpreter embedding (likely replaced by JS/WASM glue in the new version).

## 2. Application Layer (`src/App`)

The `App` module contains the business logic of the CAD application, decoupled from the GUI.

*   **Property Framework** (`src/App/Property.h`, `PropertyContainer.h`):
    *   **Property**: The atomic unit of state. Properties are strongly typed (e.g., `PropertyFloat`, `PropertyPlacement`, `PropertyLink`).
    *   **PropertyContainer**: Base class for objects that hold properties. Handles serialization and editor interaction.
    *   **Key Logic**:
        *   Properties track their "touched" state (dirty flags).
        *   Properties handle their own persistence (save/restore).
        *   Properties can be linked (parametric dependencies).
*   **Document Object Model** (`src/App/Document.h`, `DocumentObject.h`):
    *   **Document**: The root container.
        *   Manages a list of `DocumentObject`s.
        *   Handles File I/O (Save/Load).
        *   **Transaction System**: Manages Undo/Redo stacks.
        *   **Dependency Graph**: Topologically sorts objects based on links to determine recompute order.
    *   **DocumentObject**: The entities in the document (e.g., a Cube, a Cut, a Sketch).
        *   Inherits from `PropertyContainer`.
        *   `execute()` method: The core logic for recalculating the object's shape based on its properties.
*   **Parametric Modeling**:
    *   **Links**: Objects can link to other objects (e.g., a Pocket operation links to a Sketch).
    *   **Expression Engine**: Properties can be driven by mathematical expressions referencing other properties (e.g., `Cube.Length = Cylinder.Radius * 2`).
    *   **DAG (Directed Acyclic Graph)**: The application ensures that dependencies do not form cycles and recomputes the graph when a property changes.

## 3. Geometry Integration (`src/Mod/Part`)

FreeCAD uses OpenCASCADE (OCCT) as its geometry kernel. The `Part` module wraps OCCT classes.

*   **TopoShape**: The wrapper around OCCT's `TopoDS_Shape`. This represents the actual BRep (Boundary Representation) geometry (vertices, edges, faces, solids).
*   **PartFeature**: A `DocumentObject` specialized for geometric shapes. It holds a `Shape` property (which stores the `TopoShape`).
*   **Geometry Operations**: Boolean operations (Cut, Fuse, Common), Extrusions, Revolves, Fillets, etc., are implemented here by calling OCCT functions.

## 4. Key Logic for Rust/WASM Port

To replicate this "core logic" in Rust, the following components are essential:

1.  **Rust Structs for Math**: `Vector3`, `Matrix4`, `Placement` (using crates like `nalgebra` or `glam` is recommended).
2.  **ECS-like or Graph-based Object System**:
    *   Instead of deep C++ inheritance, Rust might benefit from a composition pattern or an Entity-Component-System (ECS) where "Properties" are components data, and "Systems" handle the `execute()` logic.
    *   Alternatively, a `struct Document` holding a `HashMap<ID, Object>` and a `Dag` for dependencies.
3.  **Property System**:
    *   Needs to be serializable (Serde).
    *   Needs to support change detection (Observability).
    *   Enum-based `Property` type (e.g., `enum PropertyValue { Float(f64), String(String), Link(ID), ... }`).
4.  **Geometry Abstraction**:
    *   The prototype cannot easily include the full OpenCASCADE kernel.
    *   **Option A**: Use a pure Rust geometry kernel (e.g., `truck`, `parry`).
    *   **Option B**: Define a `Shape` trait and implement a mock/simple kernel (Box, Sphere) for the prototype.
    *   **Option C**: Use `wasm-bindgen` to link to `opencascade.js` (heavy, but accurate to FreeCAD).
5.  **WASM Interface**:
    *   Expose `Document`, `addObject`, `setProperty`, `compute` to JavaScript.
    *   Return mesh data (buffers) for rendering in the PWA (Three.js/Babylon.js).
