mod math;
mod property;
mod geometry;
mod object;
mod document;

use wasm_bindgen::prelude::*;
use document::Document;
use object::ObjectType;
use property::Property;
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
            let obj_id = doc.add_object(ObjectType::Box);
            doc.set_object_property(obj_id, "Length".to_string(), Property::Float(length));
            doc.set_object_property(obj_id, "Width".to_string(), Property::Float(width));
            doc.set_object_property(obj_id, "Height".to_string(), Property::Float(height));
            doc.recompute();
            return obj_id;
        }
    }
    0
}

/// Update box dimensions
#[wasm_bindgen]
pub fn update_box(doc_id: u32, obj_id: u32, length: f64, width: f64, height: f64) -> bool {
    let mut docs = DOCUMENTS.lock().unwrap();
    if let Some(docs_map) = docs.as_mut() {
        if let Some(doc) = docs_map.get_mut(&doc_id) {
            doc.set_object_property(obj_id, "Length".to_string(), Property::Float(length));
            doc.set_object_property(obj_id, "Width".to_string(), Property::Float(width));
            doc.set_object_property(obj_id, "Height".to_string(), Property::Float(height));
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
}
