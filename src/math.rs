use glam::{Quat, Vec3, Mat4};
use serde::{Deserialize, Serialize};

/// Represents a 3D placement in space with position and rotation
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Placement {
    pub position: Vec3,
    pub rotation: Quat,
}

impl Placement {
    /// Create a new placement at origin with no rotation
    pub fn new() -> Self {
        Self {
            position: Vec3::ZERO,
            rotation: Quat::IDENTITY,
        }
    }

    /// Create a placement with given position and rotation
    pub fn from_position_rotation(position: Vec3, rotation: Quat) -> Self {
        Self { position, rotation }
    }

    /// Transform a point by this placement
    pub fn transform_point(&self, p: Vec3) -> Vec3 {
        self.rotation * p + self.position
    }

    /// Convert this placement to a 4x4 transformation matrix
    pub fn to_matrix4(&self) -> Mat4 {
        Mat4::from_rotation_translation(self.rotation, self.position)
    }
}

impl Default for Placement {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_placement_new() {
        let placement = Placement::new();
        assert_eq!(placement.position, Vec3::ZERO);
        assert_eq!(placement.rotation, Quat::IDENTITY);
    }

    #[test]
    fn test_transform_point() {
        let placement = Placement::from_position_rotation(
            Vec3::new(1.0, 2.0, 3.0),
            Quat::IDENTITY,
        );
        let point = Vec3::new(1.0, 0.0, 0.0);
        let transformed = placement.transform_point(point);
        assert_eq!(transformed, Vec3::new(2.0, 2.0, 3.0));
    }

    #[test]
    fn test_to_matrix4() {
        let placement = Placement::from_position_rotation(
            Vec3::new(1.0, 2.0, 3.0),
            Quat::IDENTITY,
        );
        let matrix = placement.to_matrix4();
        let expected = Mat4::from_translation(Vec3::new(1.0, 2.0, 3.0));
        assert_eq!(matrix, expected);
    }
}
