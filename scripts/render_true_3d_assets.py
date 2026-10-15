import bpy
import bmesh
import math
import os

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)

def create_pbr_materials():
    mats = {}

    # 1. Cozy Honey Teak (Kayu Jati Madu Hangat)
    mat_teak = bpy.data.materials.new(name="Mat_Teak")
    mat_teak.use_nodes = True
    nt1 = mat_teak.node_tree
    nt1.nodes.clear()
    coord1 = nt1.nodes.new("ShaderNodeTexCoord")
    map1 = nt1.nodes.new("ShaderNodeMapping")
    map1.inputs["Scale"].default_value = (1.5, 1.5, 10.0)
    nt1.links.new(coord1.outputs["Object"], map1.inputs["Vector"])
    wave1 = nt1.nodes.new("ShaderNodeTexWave")
    wave1.wave_type = 'BANDS'
    wave1.inputs["Scale"].default_value = 8.0
    wave1.inputs["Distortion"].default_value = 2.0
    nt1.links.new(map1.outputs["Vector"], wave1.inputs["Vector"])
    cramp1 = nt1.nodes.new("ShaderNodeValToRGB")
    cramp1.color_ramp.elements[0].position = 0.25
    cramp1.color_ramp.elements[0].color = (0.58, 0.34, 0.16, 1.0) # Rich warm caramel teak
    cramp1.color_ramp.elements[1].position = 0.75
    cramp1.color_ramp.elements[1].color = (0.36, 0.18, 0.08, 1.0) # Deep wood grain
    nt1.links.new(wave1.outputs["Color"], cramp1.inputs["Fac"])
    bump1 = nt1.nodes.new("ShaderNodeBump")
    bump1.inputs["Strength"].default_value = 0.22
    nt1.links.new(wave1.outputs["Fac"], bump1.inputs["Height"])
    bsdf1 = nt1.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf1.inputs["Roughness"].default_value = 0.32
    nt1.links.new(cramp1.outputs["Color"], bsdf1.inputs["Base Color"])
    nt1.links.new(bump1.outputs["Normal"], bsdf1.inputs["Normal"])
    out1 = nt1.nodes.new("ShaderNodeOutputMaterial")
    nt1.links.new(bsdf1.outputs["BSDF"], out1.inputs["Surface"])
    mats["teak"] = mat_teak

    # 2. Vibrant Warm Terracotta (Genteng Oranye Cerah Nusantara)
    mat_tile = bpy.data.materials.new(name="Mat_Terracotta")
    mat_tile.use_nodes = True
    nt2 = mat_tile.node_tree
    nt2.nodes.clear()
    coord2 = nt2.nodes.new("ShaderNodeTexCoord")
    wave2 = nt2.nodes.new("ShaderNodeTexWave")
    wave2.wave_type = 'BANDS'
    wave2.inputs["Scale"].default_value = 24.0
    wave2.inputs["Distortion"].default_value = 0.15
    nt2.links.new(coord2.outputs["Object"], wave2.inputs["Vector"])
    cramp2 = nt2.nodes.new("ShaderNodeValToRGB")
    cramp2.color_ramp.elements[0].position = 0.2
    cramp2.color_ramp.elements[0].color = (0.86, 0.36, 0.16, 1.0) # Vibrant burnt terracotta orange
    cramp2.color_ramp.elements[1].position = 0.8
    cramp2.color_ramp.elements[1].color = (0.56, 0.20, 0.08, 1.0) # Terracotta shadow
    nt2.links.new(wave2.outputs["Color"], cramp2.inputs["Fac"])
    bump2 = nt2.nodes.new("ShaderNodeBump")
    bump2.inputs["Strength"].default_value = 0.45
    nt2.links.new(wave2.outputs["Fac"], bump2.inputs["Height"])
    bsdf2 = nt2.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf2.inputs["Roughness"].default_value = 0.40
    nt2.links.new(cramp2.outputs["Color"], bsdf2.inputs["Base Color"])
    nt2.links.new(bump2.outputs["Normal"], bsdf2.inputs["Normal"])
    out2 = nt2.nodes.new("ShaderNodeOutputMaterial")
    nt2.links.new(bsdf2.outputs["BSDF"], out2.inputs["Surface"])
    mats["terracotta"] = mat_tile

    # 3. Soft Andesite Stone (Batu Andesit Halus)
    mat_stone = bpy.data.materials.new(name="Mat_Andesite")
    mat_stone.use_nodes = True
    nt3 = mat_stone.node_tree
    nt3.nodes.clear()
    coord3 = nt3.nodes.new("ShaderNodeTexCoord")
    noise3 = nt3.nodes.new("ShaderNodeTexNoise")
    noise3.inputs["Scale"].default_value = 25.0
    noise3.inputs["Detail"].default_value = 3.0
    nt3.links.new(coord3.outputs["Object"], noise3.inputs["Vector"])
    cramp3 = nt3.nodes.new("ShaderNodeValToRGB")
    cramp3.color_ramp.elements[0].position = 0.2
    cramp3.color_ramp.elements[0].color = (0.42, 0.44, 0.46, 1.0) # Volcanic basalt grey
    cramp3.color_ramp.elements[1].position = 0.8
    cramp3.color_ramp.elements[1].color = (0.60, 0.62, 0.64, 1.0) # Light andesite stone
    nt3.links.new(noise3.outputs["Fac"], cramp3.inputs["Fac"])
    bump3 = nt3.nodes.new("ShaderNodeBump")
    bump3.inputs["Strength"].default_value = 0.25
    nt3.links.new(noise3.outputs["Fac"], bump3.inputs["Height"])
    bsdf3 = nt3.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf3.inputs["Roughness"].default_value = 0.55
    nt3.links.new(cramp3.outputs["Color"], bsdf3.inputs["Base Color"])
    nt3.links.new(bump3.outputs["Normal"], bsdf3.inputs["Normal"])
    out3 = nt3.nodes.new("ShaderNodeOutputMaterial")
    nt3.links.new(bsdf3.outputs["BSDF"], out3.inputs["Surface"])
    mats["andesite"] = mat_stone

    # 4. Prada Royal Gold (Emas Prada Berkilau)
    mat_gold = bpy.data.materials.new(name="Mat_PradaGold")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs["Base Color"].default_value = (1.0, 0.84, 0.22, 1.0) # Pure vibrant gold
        bsdf_g.inputs["Metallic"].default_value = 0.98
        bsdf_g.inputs["Roughness"].default_value = 0.12
    mats["prada_gold"] = mat_gold

    # 5. Golden Bamboo (Bambu Kuning Keemasan)
    mat_bamboo = bpy.data.materials.new(name="Mat_Bamboo")
    mat_bamboo.use_nodes = True
    bsdf_b = mat_bamboo.node_tree.nodes.get("Principled BSDF")
    if bsdf_b:
        bsdf_b.inputs["Base Color"].default_value = (0.88, 0.76, 0.40, 1.0)
        bsdf_b.inputs["Roughness"].default_value = 0.35
    mats["bamboo"] = mat_bamboo

    # 6. Warm Golden Thatch (Jerami / Ijuk Hangat)
    mat_thatch = bpy.data.materials.new(name="Mat_Thatch")
    mat_thatch.use_nodes = True
    nt6 = mat_thatch.node_tree
    nt6.nodes.clear()
    coord6 = nt6.nodes.new("ShaderNodeTexCoord")
    wave6 = nt6.nodes.new("ShaderNodeTexWave")
    wave6.wave_type = 'BANDS'
    wave6.inputs["Scale"].default_value = 18.0
    wave6.inputs["Distortion"].default_value = 1.5
    nt6.links.new(coord6.outputs["Object"], wave6.inputs["Vector"])
    cramp6 = nt6.nodes.new("ShaderNodeValToRGB")
    cramp6.color_ramp.elements[0].position = 0.3
    cramp6.color_ramp.elements[0].color = (0.68, 0.50, 0.24, 1.0) # Rich golden-brown straw
    cramp6.color_ramp.elements[1].position = 0.8
    cramp6.color_ramp.elements[1].color = (0.40, 0.28, 0.14, 1.0) # Thatch shadow
    nt6.links.new(wave6.outputs["Color"], cramp6.inputs["Fac"])
    bump6 = nt6.nodes.new("ShaderNodeBump")
    bump6.inputs["Strength"].default_value = 0.35
    nt6.links.new(wave6.outputs["Fac"], bump6.inputs["Height"])
    bsdf6 = nt6.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf6.inputs["Roughness"].default_value = 0.60
    nt6.links.new(cramp6.outputs["Color"], bsdf6.inputs["Base Color"])
    nt6.links.new(bump6.outputs["Normal"], bsdf6.inputs["Normal"])
    out6 = nt6.nodes.new("ShaderNodeOutputMaterial")
    nt6.links.new(bsdf6.outputs["BSDF"], out6.inputs["Surface"])
    mats["thatch"] = mat_thatch

    # 7. Plump Burlap Grain Sacks (Karung Padi Bulat)
    mat_sack = bpy.data.materials.new(name="Mat_Burlap")
    mat_sack.use_nodes = True
    bsdf_s = mat_sack.node_tree.nodes.get("Principled BSDF")
    if bsdf_s:
        bsdf_s.inputs["Base Color"].default_value = (0.85, 0.74, 0.52, 1.0)
        bsdf_s.inputs["Roughness"].default_value = 0.65
    mats["burlap"] = mat_sack

    # 8. Royal Scarlet Red (Merah Rontek Keraton)
    mat_red = bpy.data.materials.new(name="Mat_RedFlag")
    mat_red.use_nodes = True
    bsdf_r = mat_red.node_tree.nodes.get("Principled BSDF")
    if bsdf_r:
        bsdf_r.inputs["Base Color"].default_value = (0.95, 0.16, 0.16, 1.0)
        bsdf_r.inputs["Roughness"].default_value = 0.35
    mats["red_flag"] = mat_red

    # 9. Ivory White Flag
    mat_white = bpy.data.materials.new(name="Mat_WhiteFlag")
    mat_white.use_nodes = True
    bsdf_w = mat_white.node_tree.nodes.get("Principled BSDF")
    if bsdf_w:
        bsdf_w.inputs["Base Color"].default_value = (0.98, 0.98, 0.96, 1.0)
        bsdf_w.inputs["Roughness"].default_value = 0.35
    mats["white_flag"] = mat_white

    # 10. Emerald Jade Scales (Naga Zamrud Hijau Berkilau)
    mat_jade = bpy.data.materials.new(name="Mat_Jade")
    mat_jade.use_nodes = True
    nt10 = mat_jade.node_tree
    nt10.nodes.clear()
    coord10 = nt10.nodes.new("ShaderNodeTexCoord")
    noise10 = nt10.nodes.new("ShaderNodeTexNoise")
    noise10.inputs["Scale"].default_value = 16.0
    nt10.links.new(coord10.outputs["Object"], noise10.inputs["Vector"])
    cramp10 = nt10.nodes.new("ShaderNodeValToRGB")
    cramp10.color_ramp.elements[0].position = 0.3
    cramp10.color_ramp.elements[0].color = (0.12, 0.75, 0.48, 1.0) # Bright emerald jade
    cramp10.color_ramp.elements[1].position = 0.8
    cramp10.color_ramp.elements[1].color = (0.24, 0.88, 0.62, 1.0) # Glowing mint highlight
    nt10.links.new(noise10.outputs["Fac"], cramp10.inputs["Fac"])
    bsdf10 = nt10.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf10.inputs["Roughness"].default_value = 0.18
    if "Specular IOR Level" in bsdf10.inputs:
        bsdf10.inputs["Specular IOR Level"].default_value = 0.95
    nt10.links.new(cramp10.outputs["Color"], bsdf10.inputs["Base Color"])
    out10 = nt10.nodes.new("ShaderNodeOutputMaterial")
    nt10.links.new(bsdf10.outputs["BSDF"], out10.inputs["Surface"])
    mats["jade"] = mat_jade

    # 11. Buttercream Belly Scutes
    mat_belly = bpy.data.materials.new(name="Mat_Belly")
    mat_belly.use_nodes = True
    bsdf_be = mat_belly.node_tree.nodes.get("Principled BSDF")
    if bsdf_be:
        bsdf_be.inputs["Base Color"].default_value = (0.96, 0.90, 0.60, 1.0)
        bsdf_be.inputs["Roughness"].default_value = 0.28
    mats["belly"] = mat_belly

    # 12. Glowing Ruby Eyes
    mat_ruby = bpy.data.materials.new(name="Mat_Ruby")
    mat_ruby.use_nodes = True
    bsdf_ru = mat_ruby.node_tree.nodes.get("Principled BSDF")
    if bsdf_ru:
        bsdf_ru.inputs["Base Color"].default_value = (1.0, 0.12, 0.25, 1.0)
        if "Emission Color" in bsdf_ru.inputs:
            bsdf_ru.inputs["Emission Color"].default_value = (1.0, 0.12, 0.25, 1.0)
            bsdf_ru.inputs["Emission Strength"].default_value = 6.0
    mats["ruby"] = mat_ruby

    # 13. Ivory Fangs
    mat_ivory = bpy.data.materials.new(name="Mat_Ivory")
    mat_ivory.use_nodes = True
    bsdf_iv = mat_ivory.node_tree.nodes.get("Principled BSDF")
    if bsdf_iv:
        bsdf_iv.inputs["Base Color"].default_value = (0.98, 0.97, 0.92, 1.0)
        bsdf_iv.inputs["Roughness"].default_value = 0.20
    mats["ivory"] = mat_ivory

    # 14. Playful River Turquoise Foam
    mat_foam = bpy.data.materials.new(name="Mat_WaterFoam")
    mat_foam.use_nodes = True
    nt14 = mat_foam.node_tree
    nt14.nodes.clear()
    coord14 = nt14.nodes.new("ShaderNodeTexCoord")
    noise14 = nt14.nodes.new("ShaderNodeTexNoise")
    noise14.inputs["Scale"].default_value = 14.0
    nt14.links.new(coord14.outputs["Object"], noise14.inputs["Vector"])
    cramp14 = nt14.nodes.new("ShaderNodeValToRGB")
    cramp14.color_ramp.elements[0].position = 0.35
    cramp14.color_ramp.elements[0].color = (0.32, 0.82, 0.78, 0.85) # Crystal river turquoise
    cramp14.color_ramp.elements[1].position = 0.80
    cramp14.color_ramp.elements[1].color = (0.95, 1.0, 1.0, 1.0) # Sparkling white foam
    nt14.links.new(noise14.outputs["Fac"], cramp14.inputs["Fac"])
    bsdf14 = nt14.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf14.inputs["Roughness"].default_value = 0.10
    nt14.links.new(cramp14.outputs["Color"], bsdf14.inputs["Base Color"])
    out14 = nt14.nodes.new("ShaderNodeOutputMaterial")
    nt14.links.new(bsdf14.outputs["BSDF"], out14.inputs["Surface"])
    mats["water_foam"] = mat_foam

    # 15. Terracotta Ceramic Water Urn (Genthong Tanah Liat)
    mat_urn = bpy.data.materials.new(name="Mat_CeramicUrn")
    mat_urn.use_nodes = True
    bsdf_u = mat_urn.node_tree.nodes.get("Principled BSDF")
    if bsdf_u:
        bsdf_u.inputs["Base Color"].default_value = (0.75, 0.32, 0.16, 1.0)
        bsdf_u.inputs["Roughness"].default_value = 0.30
    mats["urn"] = mat_urn

    return mats

def setup_camera(target_z=1.80, ortho_scale=7.5):
    scene = bpy.context.scene

    cam_data = bpy.data.cameras.new("IsoCamera")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = ortho_scale
    cam_obj = bpy.data.objects.new("IsoCamera", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    dist = 16.0
    cam_obj.location = (
        dist * math.sin(math.radians(45)) * math.cos(math.radians(30)),
        -dist * math.cos(math.radians(45)) * math.cos(math.radians(30)),
        dist * math.sin(math.radians(30)) + target_z
    )
    cam_obj.rotation_euler = (math.radians(60), 0, math.radians(45))

    # Key Sunlight (Warm Golden Peach Sun)
    sun = bpy.data.lights.new("SunKey", 'SUN')
    sun.energy = 4.4
    sun.color = (1.0, 0.95, 0.88)
    sun.angle = math.radians(6)
    sun_obj = bpy.data.objects.new("SunKey", sun)
    sun_obj.rotation_euler = (math.radians(45), math.radians(16), math.radians(30))
    scene.collection.objects.link(sun_obj)

    # Soft Sky Fill (Pastel Sky Ambient)
    fill = bpy.data.lights.new("SkyFill", 'SUN')
    fill.energy = 1.8
    fill.color = (0.72, 0.88, 1.0)
    fill_obj = bpy.data.objects.new("SkyFill", fill)
    fill_obj.rotation_euler = (math.radians(-35), math.radians(-40), math.radians(-120))
    scene.collection.objects.link(fill_obj)

    # Golden Rim Light (Chunky Diorama Silhouette Pop)
    rim = bpy.data.lights.new("RimLight", 'SUN')
    rim.energy = 2.8
    rim.color = (1.0, 0.88, 0.45)
    rim_obj = bpy.data.objects.new("RimLight", rim)
    rim_obj.rotation_euler = (math.radians(70), math.radians(-30), math.radians(-150))
    scene.collection.objects.link(rim_obj)

    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 48
    scene.render.film_transparent = True
    scene.render.resolution_x = 512
    scene.render.resolution_y = 512
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

def add_point_light(location, energy=35.0, color=(1.0, 0.82, 0.45)):
    light_data = bpy.data.lights.new("CozyPointLight", 'POINT')
    light_data.energy = energy
    light_data.color = color
    light_data.shadow_soft_size = 0.25
    light_obj = bpy.data.objects.new("CozyPointLight", light_data)
    light_obj.location = location
    bpy.context.scene.collection.objects.link(light_obj)
    return light_obj

def add_box(location, scale, material=None, name="Box", bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (scale[0] / 2, scale[1] / 2, scale[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    if material:
        obj.data.materials.append(material)
    if bevel > 0:
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 3
    return obj

def add_cylinder(location, radius, depth, material=None, vertices=16, name="Cyl", rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    if material:
        obj.data.materials.append(material)
    return obj

def add_hip_roof(location, bottom_w, top_w, height, material=None, name="Roof"):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    hbw = bottom_w / 2
    htw = top_w / 2
    b1 = bm.verts.new((-hbw, -hbw, 0))
    b2 = bm.verts.new((hbw, -hbw, 0))
    b3 = bm.verts.new((hbw, hbw, 0))
    b4 = bm.verts.new((-hbw, hbw, 0))
    t1 = bm.verts.new((-htw, -htw, height))
    t2 = bm.verts.new((htw, -htw, height))
    t3 = bm.verts.new((htw, htw, height))
    t4 = bm.verts.new((-htw, htw, height))
    bm.faces.new((b1, b2, t2, t1))
    bm.faces.new((b2, b3, t3, t2))
    bm.faces.new((b3, b4, t4, t3))
    bm.faces.new((b4, b1, t1, t4))
    if top_w > 0:
        bm.faces.new((t1, t2, t3, t4))
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    return obj

# -------------------------------------------------------------
# 1. BALAI WANUA (COZY CHUNKY JOGLO KERATON)
# -------------------------------------------------------------
def build_balai_wanua(level, mats):
    setup_camera(target_z=1.85, ortho_scale=7.6)

    base_sz = 4.0 if level == 3 else (3.6 if level == 2 else 3.2)
    # Chunky Rounded Andesite Foundation Plinth
    add_box((0, 0, 0.12), (base_sz, base_sz, 0.24), mats["andesite"], "BasePlinth", bevel=0.04)
    # Warm Honey Teak Floor
    add_box((0, 0, 0.28), (base_sz - 0.24, base_sz - 0.24, 0.10), mats["teak"], "WoodFloor", bevel=0.02)
    add_point_light((0, 0, 1.6), energy=40.0, color=(1.0, 0.82, 0.45))

    # Rounded Entry Stairs
    stair_w = 0.90
    for step in range(3):
        sz = 0.32 * (3 - step)
        add_box((base_sz/2 + sz/2 - 0.05, 0, 0.08 * (step + 1)), (sz, stair_w, 0.08), mats["andesite"], bevel=0.02)
        if level >= 2:
            add_box((0, -base_sz/2 - sz/2 + 0.05, 0.08 * (step + 1)), (stair_w, sz, 0.08), mats["andesite"], bevel=0.02)

    # Two Ceramic Terracotta Water Urns (Genthong Air) flanking entrance
    urn_x = base_sz/2 - 0.15
    for uy in (-stair_w/2 - 0.22, stair_w/2 + 0.22):
        add_cylinder((urn_x, uy, 0.45), 0.15, 0.26, mats["urn"], 12, "GenthongAir")
        add_cylinder((urn_x, uy, 0.60), 0.11, 0.06, mats["teak"], 10, "GenthongLid")

    # Low Veranda Balustrades
    rail_w = (base_sz - 0.35) / 2 - stair_w / 2
    if rail_w > 0.25:
        add_box((base_sz/2 - 0.16, -stair_w/2 - rail_w/2, 0.44), (0.09, rail_w, 0.22), mats["andesite"], bevel=0.015)
        add_box((base_sz/2 - 0.16, stair_w/2 + rail_w/2, 0.44), (0.09, rail_w, 0.22), mats["andesite"], bevel=0.015)
        add_box((-base_sz/2 + 0.16, 0, 0.44), (0.09, base_sz - 0.35, 0.22), mats["andesite"], bevel=0.015)
        add_box((0, base_sz/2 - 0.16, 0.44), (base_sz - 0.35, 0.09, 0.22), mats["andesite"], bevel=0.015)

    # 4 Chunky Soko Guru Center Master Columns
    c_span = 1.40
    c_h = 2.05
    c_rad = 0.105
    guru_coords = [(-c_span/2, -c_span/2), (c_span/2, -c_span/2), (-c_span/2, c_span/2), (c_span/2, c_span/2)]
    for gx, gy in guru_coords:
        add_cylinder((gx, gy, 0.38), 0.18, 0.16, mats["andesite"], 14, "UmpakGuru")
        add_cylinder((gx, gy, 0.46 + c_h/2), c_rad, c_h, mats["teak"], 16, "SokoGuru")

    # Stacked Tumpangsari Ceiling Brackets with Gold Trim
    for tier in range(4):
        tz = 0.46 + c_h + tier * 0.09
        t_span = c_span - tier * 0.14
        add_box((0, 0, tz), (t_span + 0.22, t_span + 0.22, 0.07), mats["teak"], "Tumpangsari", bevel=0.015)
        add_box((0, 0, tz - 0.03), (t_span + 0.24, t_span + 0.24, 0.02), mats["prada_gold"], "GoldTrim")

    # Outer Columns (Soko Rawa)
    o_span = base_sz - 0.65
    o_h = 1.45
    o_rad = 0.08
    outer_coords = [
        (-o_span/2, -o_span/2), (o_span/2, -o_span/2), (-o_span/2, o_span/2), (o_span/2, o_span/2),
        (0, -o_span/2), (0, o_span/2), (-o_span/2, 0), (o_span/2, 0)
    ]
    for ox, oy in outer_coords:
        add_cylinder((ox, oy, 0.36), 0.14, 0.14, mats["andesite"], 12, "UmpakOuter")
        add_cylinder((ox, oy, 0.43 + o_h/2), o_rad, o_h, mats["teak"], 12, "SokoOuter")

    # Perimeter Timber Eave Beams
    beam_z = 0.43 + o_h
    add_box((0, -o_span/2, beam_z), (o_span, 0.12, 0.10), mats["teak"])
    add_box((0, o_span/2, beam_z), (o_span, 0.12, 0.10), mats["teak"])
    add_box((-o_span/2, 0, beam_z), (0.12, o_span, 0.10), mats["teak"])
    add_box((o_span/2, 0, beam_z), (0.12, o_span, 0.10), mats["teak"])

    # 1. Lower Flared Eaves Roof (Vibrant Terracotta)
    eave_w = base_sz + 1.05
    eave_z = beam_z + 0.05
    eave_h = 0.58
    add_hip_roof((0, 0, eave_z), eave_w, c_span + 0.55, eave_h, mats["terracotta"], "LowerEaves")
    # Chunky Golden Fascia Border Rim
    add_box((0, 0, eave_z + 0.02), (eave_w + 0.06, eave_w + 0.06, 0.05), mats["prada_gold"])

    # 2. Upper Steep Crown Roof (Joglo Tajuk)
    crown_z = eave_z + eave_h
    crown_w = c_span + 0.55
    crown_top_w = 0.65
    crown_h = 1.35
    add_hip_roof((0, 0, crown_z), crown_w, crown_top_w, crown_h, mats["terracotta"], "UpperCrown")

    # Ridge Cap
    ridge_z = crown_z + crown_h
    add_box((0, 0, ridge_z + 0.04), (crown_top_w + 0.14, crown_top_w + 0.14, 0.08), mats["teak"], "RidgeCap")

    # 3. Chunky Gleaming Prada Gold Royal Mustaka (Mahkota Kubah Emas)
    m_mat = mats["prada_gold"]
    add_box((0, 0, ridge_z + 0.10), (0.44, 0.44, 0.06), m_mat, "Mustaka_Base", bevel=0.015)
    add_cylinder((0, 0, ridge_z + 0.20), 0.16, 0.14, m_mat, 14, "Mustaka_Urn")
    add_cylinder((0, 0, ridge_z + 0.33), 0.09, 0.14, m_mat, 12, "Mustaka_Neck")
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(0, 0, ridge_z + 0.46))
    bpy.context.active_object.data.materials.append(m_mat)

    # Royal Pennants (Rontek Keraton)
    if level >= 2:
        banner_w, banner_h = 0.26, 0.80
        corners = [
            (-eave_w/2 + 0.25, -eave_w/2 + 0.25),
            (eave_w/2 - 0.25, -eave_w/2 + 0.25),
            (-eave_w/2 + 0.25, eave_w/2 - 0.25),
            (eave_w/2 - 0.25, eave_w/2 - 0.25)
        ]
        for bx, by in corners:
            add_box((bx, by, eave_z - banner_h/2), (0.02, banner_w, banner_h), mats["red_flag"], "Banner")
            add_box((bx, by, eave_z - banner_h + 0.04), (0.03, banner_w + 0.02, 0.06), mats["prada_gold"], "Fringe")

# -------------------------------------------------------------
# 2. LUMBUNG DESA (COZY CHUNKY NUSANTARA GRANARY)
# -------------------------------------------------------------
def build_lumbung_desa(level, mats):
    setup_camera(target_z=1.70, ortho_scale=7.0)

    stilt_h = 1.30
    span_x = 1.30
    span_y = 1.10

    # 4 Chunky Stilts with Stone Footings and Anti-Rodent Baffles (Pelepeh)
    coords = [(-span_x/2, -span_y/2), (span_x/2, -span_y/2), (-span_x/2, span_y/2), (span_x/2, span_y/2)]
    for sx, sy in coords:
        add_cylinder((sx, sy, 0.08), 0.16, 0.16, mats["andesite"], 12, "Footing")
        add_cylinder((sx, sy, 0.16 + stilt_h/2), 0.09, stilt_h, mats["teak"], 14, "Stilt")
        # Chunky Disc Baffle (Pelepeh Anti-Tikus)
        add_cylinder((sx, sy, 0.16 + stilt_h - 0.10), 0.26, 0.07, mats["teak"], 16, "Baffle")

    # Timber Deck Floor with Protruding Beams
    deck_w = span_x + 0.50
    deck_d = span_y + 0.50
    deck_z = 0.16 + stilt_h
    add_box((0, 0, deck_z + 0.06), (deck_w, deck_d, 0.12), mats["teak"], "Deck", bevel=0.03)
    add_point_light((0, 0, deck_z - 0.25), energy=30.0, color=(1.0, 0.80, 0.40))

    # Woven Bamboo Chamber (Bilik Lumbung Beras)
    cham_w = span_x + 0.20
    cham_d = span_y + 0.20
    cham_h = 1.25
    cham_z = deck_z + 0.12 + cham_h/2
    add_box((0, 0, cham_z), (cham_w, cham_d, cham_h), mats["bamboo"], "GrainChamber", bevel=0.04)

    # Chunky Corner Framing Posts
    for px in (-cham_w/2, cham_w/2):
        for py in (-cham_d/2, cham_d/2):
            add_cylinder((px, py, cham_z), 0.055, cham_h + 0.06, mats["teak"], 10)

    # Wooden Shutter Door
    add_box((cham_w/2 + 0.02, 0, cham_z), (0.05, 0.44, 0.75), mats["teak"], "Door", bevel=0.02)

    # Cozy Chunky Arched Thatch Roof
    roof_base_z = deck_z + 0.12 + cham_h
    eave_roof_w = cham_w + 0.95
    eave_roof_d = cham_d + 0.95
    # Tier 1: Wide warm thatch eaves
    add_hip_roof((0, 0, roof_base_z), eave_roof_w, cham_w + 0.25, 0.48, mats["thatch"], "EaveRoof")
    # Tier 2: Steep cozy thatch apex
    apex_z = roof_base_z + 0.45
    apex_h = 1.15
    add_hip_roof((0, 0, apex_z), cham_w + 0.25, 0.0, apex_h, mats["thatch"], "ApexRoof")

    # Crowning Thatch Cap & Bamboo Finial
    add_box((0, 0, apex_z + apex_h + 0.03), (0.32, 0.32, 0.06), mats["teak"], "RidgeCap", bevel=0.02)
    add_cylinder((0, 0, apex_z + apex_h + 0.11), 0.07, 0.14, mats["prada_gold"], 10, "CrowningFinial")

    # Plump Rounded Grain Sacks (Karung Padi Montok)
    all_sacks = [
        (-span_x/2 - 0.26, -span_y/2, 0.22, 0.32, 0.28, 0.38),
        (-span_x/2 - 0.24, -span_y/2 + 0.34, 0.20, 0.30, 0.30, 0.35),
        (-span_x/2 - 0.25, -span_y/2 + 0.16, 0.48, 0.28, 0.26, 0.32),
        (span_x/2 + 0.28, span_y/2 - 0.10, 0.22, 0.32, 0.28, 0.38),
        (span_x/2 + 0.26, span_y/2 + 0.22, 0.20, 0.30, 0.28, 0.34),
        (span_x/2 + 0.27, span_y/2 + 0.06, 0.48, 0.28, 0.26, 0.30)
    ]
    num_sacks = 2 if level == 1 else (4 if level == 2 else 6)
    for sx, sy, sz, w, d, h in all_sacks[:num_sacks]:
        add_box((sx, sy, sz), (w, d, h), mats["burlap"], "RiceSack", bevel=0.06)

    # Chunky Climbing Access Ladder
    ladder_len = stilt_h + 0.45
    lad_x = cham_w/2 + 0.25
    add_cylinder((lad_x, -0.18, stilt_h/2 + 0.1), 0.04, ladder_len, mats["teak"], 8, "RailL", (math.radians(12), 0, 0))
    add_cylinder((lad_x, 0.18, stilt_h/2 + 0.1), 0.04, ladder_len, mats["teak"], 8, "RailR", (math.radians(12), 0, 0))
    for r in range(5):
        add_cylinder((lad_x, 0, 0.22 + r * 0.26), 0.026, 0.36, mats["bamboo"], 6, f"Rung_{r}")

# -------------------------------------------------------------
# 3. POS RONDA (CHUNKY WATCHTOWER & KENTONGAN)
# -------------------------------------------------------------
def build_pos_ronda(level, mats):
    setup_camera(target_z=2.25, ortho_scale=7.8)

    tower_h = 2.45 + level * 0.35
    base_span = 1.50
    top_span = 1.10

    leg_coords = [
        ((-base_span/2, -base_span/2, 0), (-top_span/2, -top_span/2, tower_h)),
        ((base_span/2, -base_span/2, 0), (top_span/2, -top_span/2, tower_h)),
        ((base_span/2, base_span/2, 0), (top_span/2, top_span/2, tower_h)),
        ((-base_span/2, base_span/2, 0), (-top_span/2, top_span/2, tower_h))
    ]
    for b_pt, t_pt in leg_coords:
        add_cylinder((b_pt[0], b_pt[1], 0.08), 0.18, 0.16, mats["andesite"], 12, "Footing")
        mid_x, mid_y = (b_pt[0] + t_pt[0]) / 2, (b_pt[1] + t_pt[1]) / 2
        add_cylinder((mid_x, mid_y, tower_h/2), 0.08, tower_h, mats["teak"], 12)

    # Chunky Bracing Horizontal Ties
    for z_frac in (0.32, 0.68):
        z_pos = tower_h * z_frac
        curr_span = base_span + (top_span - base_span) * z_frac
        add_box((0, -curr_span/2, z_pos), (curr_span, 0.08, 0.08), mats["teak"], bevel=0.015)
        add_box((0, curr_span/2, z_pos), (curr_span, 0.08, 0.08), mats["teak"], bevel=0.015)
        add_box((-curr_span/2, 0, z_pos), (0.08, curr_span, 0.08), mats["teak"], bevel=0.015)
        add_box((curr_span/2, 0, z_pos), (0.08, curr_span, 0.08), mats["teak"], bevel=0.015)

    # Guard Deck Platform
    plat_w = top_span + 0.44
    add_box((0, 0, tower_h + 0.05), (plat_w, plat_w, 0.12), mats["teak"], "Deck", bevel=0.03)
    add_point_light((0, 0, tower_h + 0.45), energy=35.0, color=(1.0, 0.80, 0.40))

    # Open Timber Railing (Clean view into the watch deck)
    rail_h = 0.50
    deck_top = tower_h + 0.11
    for rx in (-plat_w/2 + 0.06, plat_w/2 - 0.06):
        for ry in (-plat_w/2 + 0.06, plat_w/2 - 0.06):
            add_cylinder((rx, ry, deck_top + rail_h/2), 0.04, rail_h, mats["teak"], 10)
    for side in ["back", "left", "right"]:
        if side == "back":
            y_pos = plat_w/2 - 0.06
            add_box((0, y_pos, deck_top + rail_h), (plat_w - 0.12, 0.05, 0.06), mats["bamboo"])
            add_box((0, y_pos, deck_top + rail_h/2), (plat_w - 0.12, 0.04, 0.05), mats["bamboo"])
        elif side == "left":
            x_pos = -plat_w/2 + 0.06
            add_box((x_pos, 0, deck_top + rail_h), (0.05, plat_w - 0.12, 0.06), mats["bamboo"])
            add_box((x_pos, 0, deck_top + rail_h/2), (0.04, plat_w - 0.12, 0.05), mats["bamboo"])
        elif side == "right":
            x_pos = plat_w/2 - 0.06
            add_box((x_pos, 0, deck_top + rail_h), (0.05, plat_w - 0.12, 0.06), mats["bamboo"])
            add_box((x_pos, 0, deck_top + rail_h/2), (0.04, plat_w - 0.12, 0.05), mats["bamboo"])

    # 4 Roof Posts
    post_h = 0.95
    p_span = top_span - 0.10
    for px in (-p_span/2, p_span/2):
        for py in (-p_span/2, p_span/2):
            add_cylinder((px, py, deck_top + post_h/2), 0.05, post_h, mats["teak"], 10)

    # Hanging Carved Kentongan Slit Drum & Mallet
    kentongan_z = deck_top + post_h - 0.35
    add_cylinder((-0.14, 0, kentongan_z + 0.16), 0.015, 0.32, mats["burlap"], 6)
    add_cylinder((0.14, 0, kentongan_z + 0.16), 0.015, 0.32, mats["burlap"], 6)
    # Chunky horizontal slit drum
    add_cylinder((0, 0, kentongan_z), 0.15, 0.56, mats["teak"], 16, "Kentongan", (0, math.radians(90), 0))
    # Carved dark slit slot
    add_box((0, -0.14, kentongan_z), (0.36, 0.04, 0.05), mats["andesite"])
    # Wooden Mallet (Tabuh Kentongan)
    add_cylinder((0.26, -0.08, kentongan_z - 0.04), 0.025, 0.28, mats["bamboo"], 6)
    add_cylinder((0.26, -0.08, kentongan_z + 0.08), 0.055, 0.09, mats["teak"], 10)

    # Pyramid Thatch Roof
    roof_z = deck_top + post_h
    roof_sz = plat_w + 0.50
    roof_h = 1.05
    add_hip_roof((0, 0, roof_z), roof_sz, 0.0, roof_h, mats["thatch"], "TowerRoof")

    # Indonesian Pennant Flag (Merah Putih Berkibar)
    if level >= 2:
        flagpole_h = 1.10
        add_cylinder((0, 0, roof_z + roof_h + flagpole_h/2), 0.024, flagpole_h, mats["bamboo"], 8)
        add_box((0.24, 0, roof_z + roof_h + flagpole_h - 0.10), (0.46, 0.018, 0.18), mats["red_flag"])
        add_box((0.24, 0, roof_z + roof_h + flagpole_h - 0.28), (0.46, 0.018, 0.18), mats["white_flag"])
        if level >= 3:
            add_cylinder((0, 0, roof_z + roof_h + flagpole_h + 0.05), 0.05, 0.10, mats["prada_gold"], 10)

    # Climbing Access Ladder
    ladder_len = tower_h + 0.40
    lad_y = -plat_w/2 - 0.10
    add_cylinder((-0.18, lad_y, tower_h/2), 0.04, ladder_len, mats["teak"], 8)
    add_cylinder((0.18, lad_y, tower_h/2), 0.04, ladder_len, mats["teak"], 8)
    for r in range(9):
        add_cylinder((0, lad_y, 0.26 * (r + 1)), 0.024, 0.36, mats["bamboo"], 6)

# -------------------------------------------------------------
# 4. SANG HYANG NAGA TUNTANG (CHUNKY STYLIZED MYTHIC DRAGON)
# -------------------------------------------------------------
def build_boss_naga(mats):
    setup_camera(target_z=1.50, ortho_scale=6.4)

    # Swirling River Turquoise Water Wave Base (Cute concentric rings)
    for layer in range(5):
        radius = 1.85 - layer * 0.28
        z_pos = layer * 0.09
        add_cylinder((0, 0, z_pos), radius, 0.10, mats["water_foam"], 32)

    # S-Curved Serpentine Body Segments
    spine_nodes = [
        (0.20, 0.35, 0.35, 0.48, 15, 10),
        (0.05, -0.15, 0.78, 0.44, -10, 15),
        (-0.22, 0.05, 1.25, 0.40, -20, -5),
        (-0.12, -0.22, 1.70, 0.36, 10, -15),
        (0.12, -0.08, 2.15, 0.32, 25, 10),
        (0.38, 0.12, 2.55, 0.30, 15, 20)
    ]

    for cx, cy, cz, rad, ry, rx in spine_nodes:
        rot = (math.radians(rx), math.radians(ry), 0)
        # Shiny Emerald Jade Body
        add_cylinder((cx, cy, cz), rad, 0.46, mats["jade"], 20, "BodySeg", rot)
        # Soft Buttercream Scute Belly
        add_box((cx - rad * 0.55, cy, cz), (rad * 0.32, rad * 1.15, 0.42), mats["belly"], bevel=0.02)
        # Jagged Golden Dorsal Fin
        add_box((cx + rad * 0.65, cy, cz), (rad * 0.28, 0.07, 0.50), mats["prada_gold"], bevel=0.01)

    # Chunky Expressive Dragon Head
    head_pos = (0.62, 0.22, 2.88)
    add_box(head_pos, (0.65, 0.48, 0.40), mats["jade"], "DragonHead", bevel=0.04)
    # Open Maw Lower Jaw
    lower_pos = (head_pos[0] + 0.10, head_pos[1], head_pos[2] - 0.22)
    add_box(lower_pos, (0.52, 0.40, 0.15), mats["jade"], "LowerJaw", bevel=0.03)

    # Ivory Fangs
    fang_coords = [
        (head_pos[0] + 0.30, head_pos[1] - 0.16, head_pos[2] - 0.15),
        (head_pos[0] + 0.30, head_pos[1] + 0.16, head_pos[2] - 0.15),
        (lower_pos[0] + 0.24, lower_pos[1] - 0.12, lower_pos[2] + 0.08),
        (lower_pos[0] + 0.24, lower_pos[1] + 0.12, lower_pos[2] + 0.08)
    ]
    for fx, fy, fz in fang_coords:
        add_cylinder((fx, fy, fz), 0.025, 0.15, mats["ivory"], 8)

    # Big Glowing Ruby Eyes
    eye_z = head_pos[2] + 0.09
    add_cylinder((head_pos[0] + 0.16, head_pos[1] - 0.25, eye_z), 0.055, 0.09, mats["ruby"], 12)
    add_cylinder((head_pos[0] + 0.16, head_pos[1] + 0.25, eye_z), 0.055, 0.09, mats["ruby"], 12)

    # Branching Golden Antler Horns (Sungu Kencana)
    for hy in (-0.17, 0.17):
        horn_base = (head_pos[0] - 0.18, head_pos[1] + hy, head_pos[2] + 0.40)
        add_cylinder(horn_base, 0.05, 0.78, mats["prada_gold"], 10, "MainHorn", (math.radians(-15), math.radians(20), 0))
        add_cylinder((horn_base[0] - 0.12, horn_base[1] + (0.11 if hy > 0 else -0.11), horn_base[2] + 0.30), 0.035, 0.42, mats["prada_gold"], 8)

    # Flowing Whiskers
    for wy in (-0.18, 0.18):
        whisker_pos = (head_pos[0] + 0.50, head_pos[1] + wy * 1.4, head_pos[2] - 0.06)
        add_cylinder(whisker_pos, 0.024, 0.58, mats["prada_gold"], 8, "Whisker", (0, math.radians(40), math.radians(wy * 30)))

# -------------------------------------------------------------
# MAIN RENDERER
# -------------------------------------------------------------
def render_all(output_dir):
    abs_out = os.path.abspath(output_dir)
    os.makedirs(os.path.join(abs_out, "buildings"), exist_ok=True)
    os.makedirs(os.path.join(abs_out, "units"), exist_ok=True)

    tasks = [
        ("Balai Wanua Lv1", lambda mats: build_balai_wanua(1, mats), os.path.join(abs_out, "buildings", "balai_wanua_lv1.png")),
        ("Balai Wanua Lv2", lambda mats: build_balai_wanua(2, mats), os.path.join(abs_out, "buildings", "balai_wanua_lv2.png")),
        ("Balai Wanua Lv3", lambda mats: build_balai_wanua(3, mats), os.path.join(abs_out, "buildings", "balai_wanua_lv3.png")),
        ("Lumbung Desa Lv1", lambda mats: build_lumbung_desa(1, mats), os.path.join(abs_out, "buildings", "lumbung_desa_lv1.png")),
        ("Lumbung Desa Lv2", lambda mats: build_lumbung_desa(2, mats), os.path.join(abs_out, "buildings", "lumbung_desa_lv2.png")),
        ("Lumbung Desa Lv3", lambda mats: build_lumbung_desa(3, mats), os.path.join(abs_out, "buildings", "lumbung_desa_lv3.png")),
        ("Pos Ronda Lv1", lambda mats: build_pos_ronda(1, mats), os.path.join(abs_out, "buildings", "pos_ronda_lv1.png")),
        ("Pos Ronda Lv2", lambda mats: build_pos_ronda(2, mats), os.path.join(abs_out, "buildings", "pos_ronda_lv2.png")),
        ("Pos Ronda Lv3", lambda mats: build_pos_ronda(3, mats), os.path.join(abs_out, "buildings", "pos_ronda_lv3.png")),
        ("Boss Naga Banjir", lambda mats: build_boss_naga(mats), os.path.join(abs_out, "units", "boss_naga_banjir.png")),
    ]

    for title, builder, path in tasks:
        print(f"===> Modeling & Rendering Cozy Chunky 3D: {title} -> {path}...")
        clear_scene()
        mats = create_pbr_materials()
        builder(mats)
        bpy.context.scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        print(f"     Render complete: {path} ({os.path.getsize(path)} bytes)")

    print("\n[SUCCESS] All 10 Cozy Chunky 3D Assets Modeled & Rendered via Blender Cycles!")

if __name__ == "__main__":
    out_dir = "H:/Project Thoriq/Lomba IBM/frontend/public/assets"
    render_all(out_dir)
