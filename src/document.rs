use std::collections::HashMap;
use petgraph::Graph;
use serde::{Deserialize, Serialize};
use crate::object::{Object, ShapeType};
use crate::property::Property;

/// The CAD document containing all objects
#[derive(Serialize, Deserialize)]
pub struct Document {
    pub objects: HashMap<u32, Object>,
    #[serde(skip)]
    pub dependency_graph: Graph<u32, ()>,
    next_id: u32,
}

impl Document {
    /// Create a new empty document
    pub fn new() -> Self {
        Self {
            objects: HashMap::new(),
            dependency_graph: Graph::new(),
            next_id: 1,
        }
    }

    /// Add a new object to the document
    pub fn add_object(&mut self, shape_type: ShapeType) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        
        let object = Object::new(id, shape_type);
        self.objects.insert(id, object);
        
        id
    }

    /// Restore an object with a specific ID
    pub fn restore_object(&mut self, id: u32, shape_type: ShapeType) {
        let object = Object::new(id, shape_type);
        self.objects.insert(id, object);
        if id >= self.next_id {
            self.next_id = id + 1;
        }
    }

    /// Get an object by ID
    pub fn get_object(&self, id: u32) -> Option<&Object> {
        self.objects.get(&id)
    }

    /// Get a mutable reference to an object by ID
    pub fn get_object_mut(&mut self, id: u32) -> Option<&mut Object> {
        self.objects.get_mut(&id)
    }

    /// Set a property on an object
    pub fn set_object_property(&mut self, id: u32, name: String, value: Property) -> bool {
        if let Some(object) = self.objects.get_mut(&id) {
            object.set_property(name, value);
            true
        } else {
            false
        }
    }

    /// Recompute all objects in the document
    pub fn recompute(&mut self) {
        // For now, we iterate through all objects linearly
        // In the future, we can use the dependency_graph to compute in the correct order
        let ids: Vec<u32> = self.objects.keys().copied().collect();
        for id in ids {
            if let Some(object) = self.objects.get_mut(&id) {
                object.execute();
            }
        }
    }

    /// Get the mesh data for an object as a flat buffer
    pub fn get_mesh_buffer(&self, id: u32) -> Option<Vec<f32>> {
        self.objects.get(&id)
            .and_then(|obj| obj.mesh.as_ref())
            .map(|mesh| mesh.to_interleaved_buffer())
    }

    /// Get the mesh indices for an object
    pub fn get_mesh_indices(&self, id: u32) -> Option<Vec<u32>> {
        self.objects.get(&id)
            .and_then(|obj| obj.mesh.as_ref())
            .map(|mesh| mesh.indices.clone())
    }
}

impl Default for Document {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_creation() {
        let doc = Document::new();
        assert_eq!(doc.objects.len(), 0);
    }

    #[test]
    fn test_add_object() {
        let mut doc = Document::new();
        let id = doc.add_object(ShapeType::Box { length: 1.0, width: 1.0, height: 1.0 });
        assert_eq!(id, 1);
        assert!(doc.get_object(id).is_some());
    }

    #[test]
    fn test_set_object_property() {
        let mut doc = Document::new();
        let id = doc.add_object(ShapeType::Box { length: 1.0, width: 1.0, height: 1.0 });
        let success = doc.set_object_property(id, "Length".to_string(), Property::Float(5.0));
        assert!(success);
        assert_eq!(
            doc.get_object(id).unwrap().get_property("Length").unwrap().as_float(),
            Some(5.0)
        );
    }

    #[test]
    fn test_recompute() {
        let mut doc = Document::new();
        let id = doc.add_object(ShapeType::Box { length: 1.0, width: 1.0, height: 1.0 });
        doc.set_object_property(id, "Length".to_string(), Property::Float(2.0));
        doc.set_object_property(id, "Width".to_string(), Property::Float(2.0));
        doc.set_object_property(id, "Height".to_string(), Property::Float(2.0));
        doc.recompute();
        
        assert!(doc.get_object(id).unwrap().mesh.is_some());
        let buffer = doc.get_mesh_buffer(id);
        assert!(buffer.is_some());
    }
}
