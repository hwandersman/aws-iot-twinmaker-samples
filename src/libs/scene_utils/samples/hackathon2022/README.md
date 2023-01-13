Added a new sample under `scene_utils/samples/hackathon2022` to upload all of the models to a scene as specified in the building csv `Cannmont1.buildingmeshes.csv` located [here](https://code.amazon.com/packages/TwinMakerHacks2022-CityScaleTwin/blobs/mainline/--/Cannmont/Cannmont1.buildingmeshes.csv).

Prerequisites:

1. Install Blender: https://docs.blender.org/manual/en/latest/getting_started/installing/macos.html
2. Run:

```
echo "alias blender=/Applications/Blender.app/Contents/MacOS/Blender" >> ~/.bash_profile
```

3. Run:

```
source ~/.bash_profile
```

Steps to run sample city skyline scene:

Run all commands from the `scene_utils/samples/hackathon2022` directory.

1. Convert all OBJ files to GLB from the `TwinMakerHacks2022-CityScaleTwin` package

```
blender -b -P batch_gltf_export.py -- --input-path [LOCAL_WORKSPACE_PATH]/TwinMakerHacks2022-CityScaleTwin/assets/obj/ --output-path ./assets --format GLB --draco
```

2. Upload all GLB assets to S3 and add nodes to a scene

```
npx ts-node city_sample1.ts --workspaceId City1 --sceneId Cannmont4 --assetDir ./assets/blender_converted_output --buildingJson [LOCAL_WORKSPACE_PATH]/TwinMakerHacks2022-CityScaleTwin/assets/Cannmont4/building_data.json
```
