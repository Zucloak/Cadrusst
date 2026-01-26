# Prompt for Building a Rust-Powered CAD Core (WASM-ready)

**Context:**
We are building "Cadrusst", a Rust-powered CAD core wrapped in WASM for use as a Progressive Web App (PWA). We need to replicate the core logic of FreeCAD but re-architected for Rust's paradigms (safety, concurrency, composition over inheritance).

**Objective:**
Create a comprehensive Rust project prototype that implements the fundamental logic of a parametric CAD kernel. The code must be compatible with `wasm32-unknown-unknown` architecture.

**Requirements & Specifications:**

## 1. Core Architecture (The "App" Layer)
Replicate the responsibility of FreeCAD's `App` module.

*   **Document Structure**:
    *   Create a `Document` struct that acts as the container for all objects.
    *   It must manage a collection of `Object`s identified by unique IDs (UUID or incremental integers).
    *   It must maintain a Dependency Graph (DAG) to track relationships between objects (e.g., Object B depends on Object A).
    *   Implement a `recompute()` method that traverses the DAG and updates objects in topological order.
    *   Implement an Undo/Redo stack (`Transaction` system).

*   **Object & Property System**:
    *   Instead of C++ inheritance (`DocumentObject` -> `Feature` -> `Part`), use Rust's traits or enums.
    *   **Properties**: Create a robust Property system.
        *   Properties should be strongly typed but storable in a generic container. Consider using an enum `PropertyType` (Float, Integer, String, Vector, Placement, Link).
        *   Properties must support "Dirty" flags to trigger recomputes.
        *   Properties must be serializable (use `serde`).
    *   **Objects**: An `Object` should hold a map of Properties (Name -> Property).
    *   **Logic**: Define a `Compute` trait that objects implement.
        *   `fn execute(&self, dependencies: &HashMap<ID, Object>) -> Result<Geometry, Error>`

## 2. Base Math Layer (The "Base" Layer)
Replicate FreeCAD's `Base` module utilities using Rust ecosystem crates where possible.

*   Use `glam` or `nalgebra` for `Vector3` and `Matrix4`.
*   Implement a `Placement` struct (combines a Translation `Vector3` and a Rotation `Quaternion`).
    *   Implement methods to compose placements (multiplication).
    *   Implement methods to invert placements.

## 3. Geometry Kernel Abstraction
Since we cannot port the entire OpenCASCADE kernel immediately, we need an abstraction layer.

*   Define a `Geometry` enum or trait.
    *   Variants: `Mesh` (vertices/indices), `Solid` (BRep placeholder), `Primitive` (Box, Sphere params).
*   Create a "Kernel" trait that takes high-level parameters and produces a `Geometry`.
    *   *Prototype Implementation*: Implement a `SimpleKernel` that generates meshes for Boxes and Cylinders.
    *   *Future Proofing*: Structure it so we can plug in `opencascade.js` (via WASM calls) or a Rust kernel like `truck` later.

## 4. WASM Interface
The core must be callable from JavaScript.

*   Use `wasm-bindgen`.
*   Expose the `Document` class.
    *   `new() -> Document`
    *   `addObject(type: String, name: String) -> ID`
    *   `setProperty(id: ID, prop_name: String, value: JsValue)`
    *   `compute() -> JsValue` (Returns status)
    *   `getMesh(id: ID) -> Float32Array` (Returns vertex buffer for rendering)

## 5. Implementation Strategy (Step-by-Step for the AI)

1.  **Setup**: Initialize a Rust workspace with `cargo-make` or `just` for building WASM. Dependencies: `serde`, `serde_json`, `wasm-bindgen`, `glam`, `thiserror`.
2.  **Base Module**: Implement `Placement` and integration with `glam`.
3.  **Property System**: Implement the `Property` enum and a `PropertyContainer` struct.
4.  **Document Graph**: Implement the `Document` struct with a `petgraph` (or simple adjacency list) for dependencies.
5.  **Compute Loop**: Implement the Topological Sort and `execute` calls.
6.  **WASM Glue**: Write the `lib.rs` exports.

**Deliverables:**
*   `Cargo.toml` with necessary dependencies.
*   Source code structure (`src/lib.rs`, `src/core/`, `src/geometry/`).
*   Example usage in a test case ensuring that changing a generic property triggers a recompute of a dependent object.
