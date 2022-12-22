import bpy
import os
import argparse
import sys

def parse_args():
    # Get the args passed to blender after "--", all of which are ignored by
    # blender so scripts may receive their own arguments
    argv = sys.argv

    if "--" not in argv:
        # As if no args are passed
        argv = []
    else:
        # Get all args after "--"
        argv = argv[argv.index("--") + 1:]

    parser = argparse.ArgumentParser( description='Batch converts OBJ models to GLTF or GLB')
    parser.add_argument('--input-path', required=True, default=None, help='Path to a file or directory with your 3D assets')
    parser.add_argument('--output-path', required=False, default='.', help='Path to the output of converted files')
    parser.add_argument('--format', required=False, default='GLTF', help='Output file format (GLTF or GLB)')
    parser.add_argument('--draco', required=False, default=False, action='store_true', help='Use draco compression to export files')
        
    if not argv:
        parser.print_help()
        raise Exception('Please provide arguments as described above.')

    return parser.parse_args(argv)

def convert_format_code(args_format):
    args_format_upper = args_format.upper()
    if args_format_upper == 'GLB':
        return 'GLB'
    elif args_format == 'GLTF':
        return 'GLTF_EMBEDDED'
    else:
        raise Exception('--format must be either GLTF or GLB')

def export_to_gltf(args_format, args_draco, output_path, file_path):
    bpy.ops.object.select_all(action='SELECT')

    file_name = os.path.basename(file_path)

    file_name_stripped = file_name.replace('.obj', '')
    file_output_path = os.path.join(output_path, file_name_stripped)

    # First import the OBJ file
    bpy.ops.import_scene.obj(
        filepath=file_path
    )

    # Then export it as a GLTF/GLB
    bpy.ops.export_scene.gltf(
        export_format=args_format,
        export_draco_mesh_compression_enable=args_draco,
        filepath=file_output_path)

def main():
    args = parse_args()

    args_format = convert_format_code(args.format)

    output_path = os.path.join(args.output_path, 'blender_converted_output')
    os.makedirs(output_path, exist_ok=True)

    # Filter OBJ files in the input directory
    # TODO: Parse 3D object directories with their textures
    if os.path.isdir(args.input_path):
        files = [f for f in os.listdir(args.input_path) if f.endswith('.obj')]

        print(f'Found {len(files)} .obj files. Processing...')

        for f in files:
            file_path = os.path.join(args.input_path, f)
            export_to_gltf(args_format, args.draco, output_path, file_path)

    elif args.input_path.endswith('.obj'):
        print('Found 1 .obj file. Processing...')
        export_to_gltf(args_format, args.draco, output_path, args.input_path)
    else:
        raise Exception('--input-path must be an .obj file or a directory with .obj files')

if __name__ == '__main__':
    main()