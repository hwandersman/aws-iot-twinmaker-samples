import { SceneFactoryImpl } from "../../factory/scene_factory_impl";
import { EmptyNode } from "../../node/empty_node";
import { parseArgs, parseCsv, processBuildingTransforms } from "./sample_utils";

const { workspaceId, sceneId, assetDir, assetCsv } = parseArgs();

const factory = new SceneFactoryImpl();

// Create a scene or load an existing scene for updates
factory.loadOrCreateSceneIfNotExists(workspaceId, sceneId).then(async (twinMakerScene) => {
    // Clear scene to fully overwrite it
    twinMakerScene.clear();
  
    // Add a Root Node to the Scene
    console.log('Building City Skyline scene...');
    const rootNode = new EmptyNode('Root');
  
    // Set the Environmental Preset in the Scene settings
    twinMakerScene.setEnviromentPreset('neutral');

    const csvResult = parseCsv(assetCsv);
    const modelRefNodes = processBuildingTransforms(assetDir, csvResult);

    for (const node of modelRefNodes) {
        rootNode.addChildNode(node);
    }

    twinMakerScene.addRootNodeIfNameNotExist(rootNode);

    // Save the changes to the Scene
    await factory.save(twinMakerScene);
});