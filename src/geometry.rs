use serde::{Deserialize, Serialize};

/// Mesh data structure containing vertices, normals, and indices
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mesh {
    pub vertices: Vec<f32>,
    pub normals: Vec<f32>,
    pub indices: Vec<u32>,
}

impl Mesh {
    pub fn new() -> Self {
        Self {
            vertices: Vec::new(),
            normals: Vec::new(),
            indices: Vec::new(),
        }
    }

    /// Convert mesh data to a flat buffer for WebGL
    /// Interleaves position and normal data: [x, y, z, nx, ny, nz, ...]
    pub fn to_interleaved_buffer(&self) -> Vec<f32> {
        let mut buffer = Vec::with_capacity(self.vertices.len() * 2);
        for i in 0..(self.vertices.len() / 3) {
            buffer.push(self.vertices[i * 3]);
            buffer.push(self.vertices[i * 3 + 1]);
            buffer.push(self.vertices[i * 3 + 2]);
            buffer.push(self.normals[i * 3]);
            buffer.push(self.normals[i * 3 + 1]);
            buffer.push(self.normals[i * 3 + 2]);
        }
        buffer
    }
}

impl Default for Mesh {
    fn default() -> Self {
        Self::new()
    }
}

/// Generate a box mesh with the given dimensions
pub fn generate_box_mesh(length: f64, width: f64, height: f64) -> Mesh {
    let l = (length / 2.0) as f32;
    let w = (width / 2.0) as f32;
    let h = (height / 2.0) as f32;

    // Define the 8 vertices of the box (for reference)
    // We'll duplicate these for proper normals per face

    // Normals for each face (we need to duplicate vertices for proper normals)
    // Instead of 8 vertices, we'll have 24 (4 per face * 6 faces)
    let mut final_vertices = Vec::new();
    let mut normals = Vec::new();
    let mut indices = Vec::new();

    // Front face (+Z)
    let front_verts = [
        -l, -w, h,
        l, -w, h,
        l, w, h,
        -l, w, h,
    ];
    let front_normal = [0.0, 0.0, 1.0];
    for i in 0..4 {
        final_vertices.extend_from_slice(&front_verts[i * 3..(i + 1) * 3]);
        normals.extend_from_slice(&front_normal);
    }
    let base = 0;
    indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);

    // Back face (-Z)
    let back_verts = [
        l, -w, -h,
        -l, -w, -h,
        -l, w, -h,
        l, w, -h,
    ];
    let back_normal = [0.0, 0.0, -1.0];
    for i in 0..4 {
        final_vertices.extend_from_slice(&back_verts[i * 3..(i + 1) * 3]);
        normals.extend_from_slice(&back_normal);
    }
    let base = 4;
    indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);

    // Top face (+Y)
    let top_verts = [
        -l, w, h,
        l, w, h,
        l, w, -h,
        -l, w, -h,
    ];
    let top_normal = [0.0, 1.0, 0.0];
    for i in 0..4 {
        final_vertices.extend_from_slice(&top_verts[i * 3..(i + 1) * 3]);
        normals.extend_from_slice(&top_normal);
    }
    let base = 8;
    indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);

    // Bottom face (-Y)
    let bottom_verts = [
        -l, -w, -h,
        l, -w, -h,
        l, -w, h,
        -l, -w, h,
    ];
    let bottom_normal = [0.0, -1.0, 0.0];
    for i in 0..4 {
        final_vertices.extend_from_slice(&bottom_verts[i * 3..(i + 1) * 3]);
        normals.extend_from_slice(&bottom_normal);
    }
    let base = 12;
    indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);

    // Right face (+X)
    let right_verts = [
        l, -w, h,
        l, -w, -h,
        l, w, -h,
        l, w, h,
    ];
    let right_normal = [1.0, 0.0, 0.0];
    for i in 0..4 {
        final_vertices.extend_from_slice(&right_verts[i * 3..(i + 1) * 3]);
        normals.extend_from_slice(&right_normal);
    }
    let base = 16;
    indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);

    // Left face (-X)
    let left_verts = [
        -l, -w, -h,
        -l, -w, h,
        -l, w, h,
        -l, w, -h,
    ];
    let left_normal = [-1.0, 0.0, 0.0];
    for i in 0..4 {
        final_vertices.extend_from_slice(&left_verts[i * 3..(i + 1) * 3]);
        normals.extend_from_slice(&left_normal);
    }
    let base = 20;
    indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);

    Mesh {
        vertices: final_vertices,
        normals,
        indices,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_box_mesh() {
        let mesh = generate_box_mesh(2.0, 2.0, 2.0);
        // Should have 24 vertices (4 per face * 6 faces)
        assert_eq!(mesh.vertices.len(), 72); // 24 * 3
        assert_eq!(mesh.normals.len(), 72);
        // Should have 36 indices (2 triangles per face * 6 faces * 3 vertices per triangle)
        assert_eq!(mesh.indices.len(), 36);
    }

    #[test]
    fn test_mesh_to_interleaved_buffer() {
        let mesh = generate_box_mesh(1.0, 1.0, 1.0);
        let buffer = mesh.to_interleaved_buffer();
        // Should have 6 floats per vertex (3 position + 3 normal) * 24 vertices
        assert_eq!(buffer.len(), 144);
    }
}
