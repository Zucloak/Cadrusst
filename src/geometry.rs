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

/// Generate a cylinder mesh with the given radius and height
pub fn generate_cylinder_mesh(radius: f64, height: f64) -> Mesh {
    let r = radius as f32;
    let h = (height / 2.0) as f32;
    let segments = 32;

    let mut vertices = Vec::new();
    let mut normals = Vec::new();
    let mut indices = Vec::new();

    // 1. Top Cap (Normal 0,1,0)
    let top_center_idx = 0;
    vertices.push(0.0); vertices.push(h); vertices.push(0.0);
    normals.push(0.0); normals.push(1.0); normals.push(0.0);

    for i in 0..=segments {
        let theta = (i as f32 / segments as f32) * std::f32::consts::TAU;
        let x = r * theta.cos();
        let z = r * theta.sin();
        vertices.push(x); vertices.push(h); vertices.push(z);
        normals.push(0.0); normals.push(1.0); normals.push(0.0);
    }

    // Indices Top Cap: Center, Next, Current (CCW)
    for i in 0..segments {
        indices.push(top_center_idx);
        indices.push(top_center_idx + 1 + i + 1); // next
        indices.push(top_center_idx + 1 + i);     // current
    }

    // 2. Bottom Cap (Normal 0,-1,0)
    let bottom_center_idx = (vertices.len() / 3) as u32;
    vertices.push(0.0); vertices.push(-h); vertices.push(0.0);
    normals.push(0.0); normals.push(-1.0); normals.push(0.0);

    for i in 0..=segments {
        let theta = (i as f32 / segments as f32) * std::f32::consts::TAU;
        let x = r * theta.cos();
        let z = r * theta.sin();
        vertices.push(x); vertices.push(-h); vertices.push(z);
        normals.push(0.0); normals.push(-1.0); normals.push(0.0);
    }

    // Indices Bottom Cap: Center, Current, Next (CCW relative to camera looking at bottom)
    for i in 0..segments {
        indices.push(bottom_center_idx);
        indices.push(bottom_center_idx + 1 + i);     // current
        indices.push(bottom_center_idx + 1 + i + 1); // next
    }

    // 3. Sides
    let side_start_idx = (vertices.len() / 3) as u32;
    for i in 0..=segments {
        let theta = (i as f32 / segments as f32) * std::f32::consts::TAU;
        let x = r * theta.cos();
        let z = r * theta.sin();
        let nx = theta.cos();
        let nz = theta.sin();

        // Top rim vertex
        vertices.push(x); vertices.push(h); vertices.push(z);
        normals.push(nx); normals.push(0.0); normals.push(nz);

        // Bottom rim vertex
        vertices.push(x); vertices.push(-h); vertices.push(z);
        normals.push(nx); normals.push(0.0); normals.push(nz);
    }

    for i in 0..segments {
        let base = side_start_idx + i * 2;
        indices.push(base);
        indices.push(base + 3);
        indices.push(base + 1);

        indices.push(base);
        indices.push(base + 2);
        indices.push(base + 3);
    }

    Mesh {
        vertices,
        normals,
        indices,
    }
}

/// Generate a sphere mesh with the given radius
pub fn generate_sphere_mesh(radius: f64) -> Mesh {
    let r = radius as f32;
    let sector_count = 32;
    let stack_count = 16;

    let mut vertices = Vec::new();
    let mut normals = Vec::new();
    let mut indices = Vec::new();

    for i in 0..=stack_count {
        let stack_angle = std::f32::consts::PI / 2.0 - (i as f32 / stack_count as f32) * std::f32::consts::PI;
        let xy = r * stack_angle.cos();
        let z = r * stack_angle.sin();

        for j in 0..=sector_count {
            let sector_angle = (j as f32 / sector_count as f32) * std::f32::consts::TAU;

            let x = xy * sector_angle.cos();
            let y = xy * sector_angle.sin();

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            let nx = x / r;
            let ny = y / r;
            let nz = z / r;

            normals.push(nx);
            normals.push(ny);
            normals.push(nz);
        }
    }

    for i in 0..stack_count {
        let k1 = (i * (sector_count + 1)) as u32;
        let k2 = k1 + sector_count + 1;

        for j in 0..sector_count {
            if i != 0 {
                indices.push(k1 + j);
                indices.push(k2 + j);
                indices.push(k1 + j + 1);
            }

            if i != (stack_count - 1) {
                indices.push(k1 + j + 1);
                indices.push(k2 + j);
                indices.push(k2 + j + 1);
            }
        }
    }

    Mesh {
        vertices,
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
