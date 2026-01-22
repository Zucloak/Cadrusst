use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::property::Property;
use crate::geometry::{Mesh, generate_box_mesh};

/// Types of objects that can be created in the document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ObjectType {
    Box,
}

/// An object in the CAD document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Object {
    pub id: u32,
    pub object_type: ObjectType,
    pub properties: HashMap<String, Property>,
    #[serde(skip)]
    pub mesh: Option<Mesh>,
}

impl Object {
    pub fn new(id: u32, object_type: ObjectType) -> Self {
        Self {
            id,
            object_type,
            properties: HashMap::new(),
            mesh: None,
        }
    }

    /// Execute the object to generate its mesh
    pub fn execute(&mut self) {
        match self.object_type {
            ObjectType::Box => {
                let length = self.properties.get("Length")
                    .and_then(|p| p.as_float())
                    .unwrap_or(1.0);
                let width = self.properties.get("Width")
                    .and_then(|p| p.as_float())
                    .unwrap_or(1.0);
                let height = self.properties.get("Height")
                    .and_then(|p| p.as_float())
                    .unwrap_or(1.0);
                
                self.mesh = Some(generate_box_mesh(length, width, height));
            }
        }
    }

    /// Set a property value
    pub fn set_property(&mut self, name: String, value: Property) {
        self.properties.insert(name, value);
    }

    /// Get a property value
    pub fn get_property(&self, name: &str) -> Option<&Property> {
        self.properties.get(name)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_object_creation() {
        let obj = Object::new(1, ObjectType::Box);
        assert_eq!(obj.id, 1);
        assert!(obj.mesh.is_none());
    }

    #[test]
    fn test_object_set_property() {
        let mut obj = Object::new(1, ObjectType::Box);
        obj.set_property("Length".to_string(), Property::Float(2.0));
        assert_eq!(obj.get_property("Length").unwrap().as_float(), Some(2.0));
    }

    #[test]
    fn test_box_execute() {
        let mut obj = Object::new(1, ObjectType::Box);
        obj.set_property("Length".to_string(), Property::Float(2.0));
        obj.set_property("Width".to_string(), Property::Float(3.0));
        obj.set_property("Height".to_string(), Property::Float(4.0));
        obj.execute();
        assert!(obj.mesh.is_some());
    }
}
