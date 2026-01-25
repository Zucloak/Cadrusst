mod math;
mod property;
mod geometry;
mod object;
mod document;

use wasm_bindgen::prelude::*;
use document::Document;
use object::ShapeType;
use property::Property;
use math::Placement;
use glam::{Vec3, Quat};
use std::sync::Mutex;
use std::collections::HashMap;

// Global document store
static DOCUMENTS: Mutex<Option<HashMap<u32, Document>>> = Mutex::new(None);
static mut NEXT_DOC_ID: u32 = 1;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Initialize the WASM module
#[wasm_bindgen]
pub fn init() {
    // Set panic hook for better error messages
    // Note: console_error_panic_hook can be added as an optional dependency later
    
    let mut docs = DOCUMENTS.lock().unwrap();
    if docs.is_none() {
        *docs = Some(HashMap::new());
    }
}

/// Create a new document and return its ID
#[wasm_bindgen]
pub fn create_document() -> u32 {
    let mut docs = DOCUMENTS.lock().unwrap();
    if docs.is_none() {
        *docs = Some(HashMap::new());
    }
    
    let doc_id = unsafe {
        let id = NEXT_DOC_ID;
        NEXT_DOC_ID += 1;
        id
    };
    
    let doc = Document::new();
    docs.as_mut().unwrap().insert(doc_id, doc);
    
    doc_id
}

/// Add a box to the document
#[wasm_bindgen]
pub fn add_box(doc_id: u32, length: f64, width: f64, height: f64) -> u32 {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
            let shape = ShapeType::Box { length: length as f32, width: width as f32, height: height as f32 };
            let obj_id = doc.add_object(shape);
            doc.set_object_property(obj_id, "Length".to_string(), Property::Float(length));
            doc.set_object_property(obj_id, "Width".to_string(), Property::Float(width));
            doc.set_object_property(obj_id, "Height".to_string(), Property::Float(height));
            doc.set_object_property(obj_id, "Placement".to_string(), Property::Placement(Placement::new()));
            doc.recompute();
            return obj_id;
        }
    }
    0
}

/// Add a cylinder to the document
#[wasm_bindgen]
pub fn add_cylinder(doc_id: u32, radius: f64, height: f64) -> u32 {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
            let shape = ShapeType::Cylinder { radius: radius as f32, height: height as f32 };
            let obj_id = doc.add_object(shape);
            doc.set_object_property(obj_id, "Radius".to_string(), Property::Float(radius));
            doc.set_object_property(obj_id, "Height".to_string(), Property::Float(height));
            doc.set_object_property(obj_id, "Placement".to_string(), Property::Placement(Placement::new()));
            doc.recompute();
            return obj_id;
        }
    }
    0
}

/// Add a sphere to the document
#[wasm_bindgen]
pub fn add_sphere(doc_id: u32, radius: f64) -> u32 {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
            let shape = ShapeType::Sphere { radius: radius as f32 };
            let obj_id = doc.add_object(shape);
            doc.set_object_property(obj_id, "Radius".to_string(), Property::Float(radius));
            doc.set_object_property(obj_id, "Placement".to_string(), Property::Placement(Placement::new()));
            doc.recompute();
            return obj_id;
        }
    }
    0
}

/// Update object placement
#[wasm_bindgen]
pub fn update_placement(doc_id: u32, obj_id: u32, px: f64, py: f64, pz: f64, qx: f64, qy: f64, qz: f64, qw: f64) -> bool {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
            let position = Vec3::new(px as f32, py as f32, pz as f32);
            let rotation = Quat::from_xyzw(qx as f32, qy as f32, qz as f32, qw as f32);
            let placement = Placement::from_position_rotation(position, rotation);

            if doc.set_object_property(obj_id, "Placement".to_string(), Property::Placement(placement)) {
                doc.recompute();
                return true;
            }
        }
    }
    false
}

/// Update shape parameters
#[wasm_bindgen]
pub fn update_shape_params(doc_id: u32, obj_id: u32, p1: f64, p2: f64, p3: f64) -> bool {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
             if let Some(obj) = doc.objects.get_mut(&obj_id) {
                 match &mut obj.shape_type {
                    ShapeType::Box { length, width, height } => {
                        *length = p1 as f32;
                        *width = p2 as f32;
                        *height = p3 as f32;
                        obj.set_property("Length".to_string(), Property::Float(p1));
                        obj.set_property("Width".to_string(), Property::Float(p2));
                        obj.set_property("Height".to_string(), Property::Float(p3));
                    }
                    ShapeType::Cylinder { radius, height } => {
                        *radius = p1 as f32;
                        *height = p2 as f32;
                        obj.set_property("Radius".to_string(), Property::Float(p1));
                        obj.set_property("Height".to_string(), Property::Float(p2));
                    }
                    ShapeType::Sphere { radius } => {
                        *radius = p1 as f32;
                        obj.set_property("Radius".to_string(), Property::Float(p1));
                    }
                }
            } else {
                return false;
            }
            doc.recompute();
            return true;
        }
    }
    false
}

/// Get mesh data for an object (interleaved position and normal data)
#[wasm_bindgen]
pub fn get_mesh_data(doc_id: u32, obj_id: u32) -> Vec<f32> {
    let docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_ref() {
        if let Some(doc) = docs_map.get(&doc_id) {
            if let Some(buffer) = doc.get_mesh_buffer(obj_id) {
                return buffer;
            }
        }
    }
    Vec::new()
}

/// Get mesh indices for an object
#[wasm_bindgen]
pub fn get_mesh_indices(doc_id: u32, obj_id: u32) -> Vec<u32> {
    let docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_ref() {
        if let Some(doc) = docs_map.get(&doc_id) {
            if let Some(indices) = doc.get_mesh_indices(obj_id) {
                return indices;
            }
        }
    }
    Vec::new()
}

/// Delete an object from the document
#[wasm_bindgen]
pub fn delete_object(doc_id: u32, obj_id: u32) -> bool {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
            return doc.objects.remove(&obj_id).is_some();
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_lifecycle() {
        init();
        let doc_id = create_document();
        assert!(doc_id > 0);
        
        let obj_id = add_box(doc_id, 2.0, 3.0, 4.0);
        assert!(obj_id > 0);
        
        let mesh_data = get_mesh_data(doc_id, obj_id);
        assert!(!mesh_data.is_empty());
        
        let indices = get_mesh_indices(doc_id, obj_id);
        assert_eq!(indices.len(), 36);
    }

    #[test]
    fn test_new_shapes() {
        init();
        let doc_id = create_document();
        let cyl_id = add_cylinder(doc_id, 1.0, 2.0);
        assert!(cyl_id > 0);
        let sph_id = add_sphere(doc_id, 1.0);
        assert!(sph_id > 0);
    }
}
