use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use glam::Vec3;
use crate::property::Property;
use crate::geometry::{Mesh, generate_box_mesh, generate_cylinder_mesh, generate_sphere_mesh};

/// Types of shapes with their parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ShapeType {
    Box { length: f32, width: f32, height: f32 },
    Cylinder { radius: f32, height: f32 },
    Sphere { radius: f32 },
}

/// An object in the CAD document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Object {
    pub id: u32,
    pub shape_type: ShapeType,
    pub properties: HashMap<String, Property>,
    #[serde(skip)]
    pub mesh: Option<Mesh>,
}

impl Object {
    pub fn new(id: u32, shape_type: ShapeType) -> Self {
        Self {
            id,
            shape_type,
            properties: HashMap::new(),
            mesh: None,
        }
    }

    /// Execute the object to generate its mesh
    pub fn execute(&mut self) {
        match &self.shape_type {
            ShapeType::Box { length, width, height } => {
                self.mesh = Some(generate_box_mesh(*length as f64, *width as f64, *height as f64));
            }
            ShapeType::Cylinder { radius, height } => {
                self.mesh = Some(generate_cylinder_mesh(*radius as f64, *height as f64));
            }
            ShapeType::Sphere { radius } => {
                self.mesh = Some(generate_sphere_mesh(*radius as f64));
            }
        }

        // Apply placement transform if it exists
        if let Some(prop) = self.get_property("Placement") {
            if let Some(placement) = prop.as_placement() {
                if let Some(mesh) = &mut self.mesh {
                    // Transform vertices
                    for i in 0..(mesh.vertices.len() / 3) {
                        let x = mesh.vertices[i*3];
                        let y = mesh.vertices[i*3+1];
                        let z = mesh.vertices[i*3+2];
                        let p = Vec3::new(x, y, z);
                        let transformed = placement.transform_point(p);
                        mesh.vertices[i*3] = transformed.x;
                        mesh.vertices[i*3+1] = transformed.y;
                        mesh.vertices[i*3+2] = transformed.z;
                    }
                    // Transform normals (rotate only)
                    for i in 0..(mesh.normals.len() / 3) {
                        let nx = mesh.normals[i*3];
                        let ny = mesh.normals[i*3+1];
                        let nz = mesh.normals[i*3+2];
                        let n = Vec3::new(nx, ny, nz);
                        let transformed = placement.rotation * n;
                        mesh.normals[i*3] = transformed.x;
                        mesh.normals[i*3+1] = transformed.y;
                        mesh.normals[i*3+2] = transformed.z;
                    }
                }
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
        let shape = ShapeType::Box { length: 1.0, width: 1.0, height: 1.0 };
        let obj = Object::new(1, shape);
        assert_eq!(obj.id, 1);
        assert!(obj.mesh.is_none());
    }

    #[test]
    fn test_object_set_property() {
        let shape = ShapeType::Box { length: 1.0, width: 1.0, height: 1.0 };
        let mut obj = Object::new(1, shape);
        obj.set_property("Length".to_string(), Property::Float(2.0));
        assert_eq!(obj.get_property("Length").unwrap().as_float(), Some(2.0));
    }

    #[test]
    fn test_box_execute() {
        let shape = ShapeType::Box { length: 2.0, width: 3.0, height: 4.0 };
        let mut obj = Object::new(1, shape);
        // Execute should use ShapeType params, not properties map
        obj.execute();
        assert!(obj.mesh.is_some());

        let mesh = obj.mesh.unwrap();
        // Just check vertices count (24 vertices * 3 floats = 72)
        assert_eq!(mesh.vertices.len(), 72);
    }
}
