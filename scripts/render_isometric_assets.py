"""
Titah Rakyat: Sovereign of the Living Realm
Procedural 3D Blender Asset Generator & 2.5D Isometric Renderer (Blender 4.4 bpy)

Models & Renders:
1. Balai Wanua (Joglo Keraton Palace, Levels 1-3)
2. Lumbung Desa (Traditional Elevated Granary, Levels 1-3)
3. Pos Ronda (Watchtower Bastion, Levels 1-3)
4. Boss Naga Banjir Sang Hyang Tuntang (Mythic River Dragon)
5. Candi Bentar (Ancient Split Gate Entrance)

Renders transparent 256x256 / 512x512 RGBA PNG sprites with true 2:1 isometric orthographic perspective.
"""

import bpy
import math
import os

# Base paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILDINGS_DIR = os.path.join(ROOT_DIR, "frontend", "public", "assets", "buildings")
UNITS_DIR = os.path.join(ROOT_DIR, "frontend", "public", "assets", "units")

os.makedirs(BUILDINGS_DIR, exist_ok=True)
os.makedirs(UNITS_DIR, exist_ok=True)

def clear_scene():
    """Removes all objects, meshes, and materials from the current scene."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def create_material(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    """Creates a Principled BSDF PBR material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emission:
            # Blender 4.4 Emission Color input
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

def setup_render_environment():
    """Configures camera, sun lighting, and isometric 2:1 projection."""
    scene = bpy.context.scene
    scene.render.resolution_x = 384
    scene.render.resolution_y = 384
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    # Sun Light (Warm Tropical Sunlight)
    sun_data = bpy.data.lights.new(name="SunLight", type='SUN')
    sun_data.energy = 3.5
    sun_data.color = (1.0, 0.94, 0.85)
    sun_obj = bpy.data.objects.new(name="SunLight", object_data=sun_data)
    bpy.context.collection.objects.link(sun_obj)
    sun_obj.location = (8.0, -8.0, 12.0)
    sun_obj.rotation_euler = (math.radians(50), math.radians(20), math.radians(-35))

    # Fill Light (Cool Ambient Sky Fill)
    fill_data = bpy.data.lights.new(name="FillLight", type='SUN')
    fill_data.energy = 1.2
    fill_data.color = (0.5, 0.7, 0.9)
    fill_obj = bpy.data.objects.new(name="FillLight", object_data=fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-8.0, 8.0, 8.0)
    fill_obj.rotation_euler = (math.radians(45), math.radians(-25), math.radians(140))

    # Orthographic Camera for 2:1 Isometric Projection
    cam_data = bpy.data.cameras.new(name="IsoCamera")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 5.6
    cam_obj = bpy.data.objects.new(name="IsoCamera", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Standard 2:1 Isometric Angles (X: 60 deg, Y: 0, Z: 45 deg)
    cam_dist = 14.0
    cam_obj.rotation_euler = (math.radians(60), 0.0, math.radians(45))
    cam_obj.location = (
        cam_dist * math.cos(math.radians(45)) * math.cos(math.radians(30)),
        -cam_dist * math.sin(math.radians(45)) * math.cos(math.radians(30)),
        cam_dist * math.sin(math.radians(30)) + 1.2
    )
    return cam_data

def build_materials():
    """Constructs shared architectural materials."""
    return {
        "stone": create_material("StoneAndesite", (0.22, 0.22, 0.24, 1.0), roughness=0.85),
        "teak": create_material("TeakWood", (0.28, 0.14, 0.06, 1.0), roughness=0.45),
        "bamboo": create_material("BambooWood", (0.68, 0.54, 0.28, 1.0), roughness=0.55),
        "roof_tile": create_material("ClayRoofTiles", (0.55, 0.20, 0.09, 1.0), roughness=0.6),
        "thatch": create_material("ThatchIjuk", (0.13, 0.10, 0.07, 1.0), roughness=0.9),
        "gold": create_material("PradaGold", (1.0, 0.82, 0.15, 1.0), metallic=0.92, roughness=0.22),
        "banner_red": create_material("BannerRed", (0.85, 0.10, 0.12, 1.0), roughness=0.5),
        "dragon_scale": create_material("DragonScale", (0.05, 0.48, 0.55, 1.0), metallic=0.3, roughness=0.25),
        "dragon_horn": create_material("DragonHorn", (0.95, 0.78, 0.15, 1.0), metallic=0.7, roughness=0.3),
        "dragon_eye": create_material("DragonEye", (1.0, 0.05, 0.05, 1.0), emission=(1.0, 0.05, 0.05, 1.0), emission_strength=6.0)
    }

# ==============================================================================
# MODEL GENERATORS
# ==============================================================================

def generate_balai_wanua(level, mats):
    """Generates procedural 3D Joglo Keraton (Levels 1-3)."""
    # 1. Stone Foundation Platform (Umpak)
    pedestal_z = 0.22 * level
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, pedestal_z / 2))
    base = bpy.context.active_object
    base.scale = (2.6 + level * 0.4, 2.6 + level * 0.4, pedestal_z)
    base.data.materials.append(mats["stone"])

    # 2. Polished Teak Floor
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, pedestal_z + 0.04))
    floor = bpy.context.active_object
    floor.scale = (2.4 + level * 0.35, 2.4 + level * 0.35, 0.08)
    floor.data.materials.append(mats["teak"])

    # 3. Soko Guru (Main Pillars)
    pillar_height = 1.6 + level * 0.3
    offset = 0.85 + level * 0.15
    pillar_coords = [(-offset, -offset), (offset, -offset), (-offset, offset), (offset, offset)]
    if level >= 2:
        # Extra outer veranda pillars
        v_offset = offset + 0.45
        pillar_coords += [(-v_offset, -v_offset), (v_offset, -v_offset), (-v_offset, v_offset), (v_offset, v_offset)]

    for px, py in pillar_coords:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.07 + (0.02 if level >= 2 else 0),
            depth=pillar_height,
            location=(px, py, pedestal_z + pillar_height / 2)
        )
        pillar = bpy.context.active_object
        pillar.data.materials.append(mats["teak"])

    # 4. Lower Tier Veranda Roof (Genteng Limasan)
    roof_z = pedestal_z + pillar_height
    bpy.ops.mesh.primitive_cone_add(
        vertices=4,
        radius1=1.85 + level * 0.35,
        radius2=0.85 + level * 0.15,
        depth=0.55,
        location=(0, 0, roof_z + 0.22)
    )
    lower_roof = bpy.context.active_object
    lower_roof.rotation_euler = (0, 0, math.radians(45))
    lower_roof.data.materials.append(mats["roof_tile"])

    # 5. Upper Tier Steep Tajug Crown (Joglo Peak)
    crown_height = 0.85 + level * 0.35
    crown_z = roof_z + 0.5 + crown_height / 2
    bpy.ops.mesh.primitive_cone_add(
        vertices=4,
        radius1=1.05 + level * 0.18,
        radius2=0.15,
        depth=crown_height,
        location=(0, 0, crown_z)
    )
    upper_roof = bpy.context.active_object
    upper_roof.rotation_euler = (0, 0, math.radians(45))
    upper_roof.data.materials.append(mats["gold" if level == 3 else "roof_tile"])

    # 6. Mustaka Finial & Royal Accents
    top_z = crown_z + crown_height / 2 + 0.12
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12 + level * 0.04, location=(0, 0, top_z))
    finial = bpy.context.active_object
    finial.data.materials.append(mats["gold"])

    if level >= 2:
        # Royal Pennant Poles with red banners
        for bx, by in [(-offset * 1.3, -offset * 1.3), (offset * 1.3, offset * 1.3)]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=2.4, location=(bx, by, pedestal_z + 1.2))
            pole = bpy.context.active_object
            pole.data.materials.append(mats["gold"])

            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx + 0.18, by, pedestal_z + 2.1))
            flag = bpy.context.active_object
            flag.scale = (0.35, 0.03, 0.22)
            flag.data.materials.append(mats["banner_red"])

def generate_lumbung_desa(level, mats):
    """Generates procedural 3D Elevated Granary (Levels 1-3)."""
    # 1. High Wooden Stilts with Anti-Vermin Klumpeng Baffles
    stilt_h = 1.35 + level * 0.15
    span = 0.75 + level * 0.1
    stilts = [(-span, -span), (span, -span), (-span, span), (span, span)]

    for sx, sy in stilts:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=stilt_h, location=(sx, sy, stilt_h / 2))
        stilt = bpy.context.active_object
        stilt.data.materials.append(mats["teak"])

        # Klumpeng baffle disc
        bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.04, location=(sx, sy, stilt_h * 0.75))
        disc = bpy.context.active_object
        disc.data.materials.append(mats["stone"])

    # 2. Granary Elevated Chamber (Wooden Planks & Woven Gedek)
    box_z = stilt_h + 0.55
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, box_z))
    chamber = bpy.context.active_object
    chamber.scale = (1.55 + level * 0.2, 1.35 + level * 0.15, 1.0)
    chamber.data.materials.append(mats["bamboo" if level == 1 else "teak"])

    # 3. Traditional Curved Boat-Shaped Thatched Roof (Atap Ijuk Melengkung)
    roof_z = box_z + 0.75
    bpy.ops.mesh.primitive_cone_add(
        vertices=4,
        radius1=1.45 + level * 0.25,
        radius2=0.45,
        depth=0.85 + level * 0.2,
        location=(0, 0, roof_z)
    )
    roof = bpy.context.active_object
    roof.scale = (1.3, 0.95, 1.0)
    roof.rotation_euler = (0, 0, math.radians(45))
    roof.data.materials.append(mats["thatch"])

    # 4. Golden Harvest Rice Sheaves (Level 2 & 3)
    if level >= 2:
        for rx in [-0.55, 0.55]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.4, location=(rx, -span - 0.1, stilt_h + 0.2))
            bundle = bpy.context.active_object
            bundle.rotation_euler = (math.radians(15), 0, 0)
            bundle.data.materials.append(mats["gold"])

def generate_pos_ronda(level, mats):
    """Generates procedural 3D Watchtower Bastion (Levels 1-3)."""
    if level == 1:
        # Open Wooden Village Gardu
        post_h = 1.1
        for px, py in [(-0.6, -0.6), (0.6, -0.6), (-0.6, 0.6), (0.6, 0.6)]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=post_h, location=(px, py, post_h / 2))
            p = bpy.context.active_object
            p.data.materials.append(mats["bamboo"])

        # Deck
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.3))
        deck = bpy.context.active_object
        deck.scale = (1.4, 1.4, 0.08)
        deck.data.materials.append(mats["teak"])

        # Thatch Roof
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.2, depth=0.6, location=(0, 0, post_h + 0.25))
        r = bpy.context.active_object
        r.rotation_euler = (0, 0, math.radians(45))
        r.data.materials.append(mats["thatch"])

        # Slit-Drum Kentongan
        bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.55, location=(0, 0.35, 0.75))
        drum = bpy.context.active_object
        drum.rotation_euler = (0, math.radians(90), 0)
        drum.data.materials.append(mats["teak"])

    elif level == 2:
        # Two-Tier Wooden Frontier Watchtower
        tower_h = 2.4
        for px, py in [(-0.7, -0.7), (0.7, -0.7), (-0.7, 0.7), (0.7, 0.7)]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=tower_h, location=(px, py, tower_h / 2))
            p = bpy.context.active_object
            p.data.materials.append(mats["teak"])

        # Guard Platform & Palisade Railing
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.6))
        platform = bpy.context.active_object
        platform.scale = (1.65, 1.65, 0.1)
        platform.data.materials.append(mats["teak"])

        # Guard Roof
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.45, depth=0.75, location=(0, 0, tower_h + 0.35))
        r = bpy.context.active_object
        r.rotation_euler = (0, 0, math.radians(45))
        r.data.materials.append(mats["roof_tile"])

    else:
        # Level 3: Stone Bastion Fortress Citadel
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.9))
        base = bpy.context.active_object
        base.scale = (1.8, 1.8, 1.8)
        base.data.materials.append(mats["stone"])

        # Battlements / Merlons
        for mx, my in [(-0.8, -0.8), (0.8, -0.8), (-0.8, 0.8), (0.8, 0.8)]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mx, my, 1.95))
            m = bpy.context.active_object
            m.scale = (0.35, 0.35, 0.3)
            m.data.materials.append(mats["stone"])

        # Central Golden Brazier / Beacon
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.4, location=(0, 0, 2.0))
        brazier = bpy.context.active_object
        brazier.data.materials.append(mats["gold"])

        bpy.ops.mesh.primitive_cone_add(radius1=0.22, depth=0.5, location=(0, 0, 2.4))
        flame = bpy.context.active_object
        flame.data.materials.append(mats["dragon_eye"])

def generate_boss_naga(mats):
    """Generates mythic Javanese water dragon (Sang Hyang Tuntang)."""
    # 1. Sinusoidal S-Curve Body Segments
    num_segments = 14
    for i in range(num_segments):
        t = i / num_segments
        x = math.sin(t * math.pi * 2.2) * 1.5
        y = (t - 0.5) * 4.2
        z = math.sin(t * math.pi * 3.0) * 0.45 + 0.65
        radius = 0.32 * (1.0 - t * 0.6)

        bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=(x, y, z))
        seg = bpy.context.active_object
        seg.data.materials.append(mats["dragon_scale"])

        # Dorsal Spines / Fins
        if i % 2 == 0 and i < 11:
            bpy.ops.mesh.primitive_cone_add(radius1=0.1, depth=0.35, location=(x, y, z + radius + 0.12))
            spine = bpy.context.active_object
            spine.data.materials.append(mats["dragon_horn"])

    # 2. Majestic Dragon Head
    head_pos = (-0.1, -2.3, 1.15)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=head_pos)
    head = bpy.context.active_object
    head.scale = (0.55, 0.85, 0.5)
    head.rotation_euler = (math.radians(-15), 0, 0)
    head.data.materials.append(mats["dragon_scale"])

    # Curved Golden Horns
    for hx in [-0.25, 0.25]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.09, depth=0.75, location=(head_pos[0] + hx, head_pos[1] + 0.25, head_pos[2] + 0.45))
        horn = bpy.context.active_object
        horn.rotation_euler = (math.radians(-35), math.radians(15 if hx > 0 else -15), 0)
        horn.data.materials.append(mats["dragon_horn"])

    # Glowing Ruby Eyes
    for ex in [-0.28, 0.28]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(head_pos[0] + ex, head_pos[1] - 0.3, head_pos[2] + 0.15))
        eye = bpy.context.active_object
        eye.data.materials.append(mats["dragon_eye"])

# ==============================================================================
# RENDER PIPELINE ORCHESTRATOR
# ==============================================================================

def render_model(output_path, generator_fn, *args, ortho_scale=5.6):
    """Clears scene, builds model, adjusts ortho scale, and renders PNG."""
    clear_scene()
    cam_data = setup_render_environment()
    cam_data.ortho_scale = ortho_scale
    mats = build_materials()

    generator_fn(*args, mats=mats)

    bpy.context.scene.render.filepath = output_path
    print(f"[Blender 4.4] Rendering: {output_path}")
    bpy.ops.render.render(write_still=True)
    print(f"[Blender 4.4] Completed: {output_path}")

def main():
    print("[Blender 4.4 Engine] Starting high-fidelity isometric asset generation...")

    # 1. Balai Wanua (Levels 1-3)
    render_model(os.path.join(BUILDINGS_DIR, "balai_wanua_lv1.png"), generate_balai_wanua, 1, ortho_scale=5.2)
    render_model(os.path.join(BUILDINGS_DIR, "balai_wanua_lv2.png"), generate_balai_wanua, 2, ortho_scale=5.6)
    render_model(os.path.join(BUILDINGS_DIR, "balai_wanua_lv3.png"), generate_balai_wanua, 3, ortho_scale=6.2)

    # 2. Lumbung Desa (Levels 1-3)
    render_model(os.path.join(BUILDINGS_DIR, "lumbung_desa_lv1.png"), generate_lumbung_desa, 1, ortho_scale=4.2)
    render_model(os.path.join(BUILDINGS_DIR, "lumbung_desa_lv2.png"), generate_lumbung_desa, 2, ortho_scale=4.6)
    render_model(os.path.join(BUILDINGS_DIR, "lumbung_desa_lv3.png"), generate_lumbung_desa, 3, ortho_scale=5.0)

    # 3. Pos Ronda (Levels 1-3)
    render_model(os.path.join(BUILDINGS_DIR, "pos_ronda_lv1.png"), generate_pos_ronda, 1, ortho_scale=3.8)
    render_model(os.path.join(BUILDINGS_DIR, "pos_ronda_lv2.png"), generate_pos_ronda, 2, ortho_scale=4.4)
    render_model(os.path.join(BUILDINGS_DIR, "pos_ronda_lv3.png"), generate_pos_ronda, 3, ortho_scale=4.8)

    # 4. Boss Naga Banjir
    render_model(os.path.join(UNITS_DIR, "boss_naga_banjir.png"), generate_boss_naga, ortho_scale=6.5)

    print("[Blender 4.4 Engine] All 10 isometric assets rendered successfully!")

if __name__ == "__main__":
    main()
