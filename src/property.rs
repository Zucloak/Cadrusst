use glam::Vec3;
use serde::{Deserialize, Serialize};
use crate::math::Placement;

/// Property enum that can hold different types of values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Property {
    Float(f64),
    String(String),
    Vector(Vec3),
    Placement(Placement),
}

impl Property {
    /// Get the property as a float, if possible
    pub fn as_float(&self) -> Option<f64> {
        match self {
            Property::Float(v) => Some(*v),
            _ => None,
        }
    }

    /// Get the property as a string, if possible
    pub fn as_string(&self) -> Option<&str> {
        match self {
            Property::String(v) => Some(v),
            _ => None,
        }
    }

    /// Get the property as a vector, if possible
    pub fn as_vector(&self) -> Option<Vec3> {
        match self {
            Property::Vector(v) => Some(*v),
            _ => None,
        }
    }

    /// Get the property as a placement, if possible
    pub fn as_placement(&self) -> Option<Placement> {
        match self {
            Property::Placement(p) => Some(*p),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_float_property() {
        let prop = Property::Float(42.0);
        assert_eq!(prop.as_float(), Some(42.0));
        assert!(prop.as_string().is_none());
    }

    #[test]
    fn test_string_property() {
        let prop = Property::String("test".to_string());
        assert_eq!(prop.as_string(), Some("test"));
        assert!(prop.as_float().is_none());
    }

    #[test]
    fn test_vector_property() {
        let vec = Vec3::new(1.0, 2.0, 3.0);
        let prop = Property::Vector(vec);
        assert_eq!(prop.as_vector(), Some(vec));
    }

    #[test]
    fn test_placement_property() {
        let placement = Placement::new();
        let prop = Property::Placement(placement);
        assert!(prop.as_placement().is_some());
    }
}
