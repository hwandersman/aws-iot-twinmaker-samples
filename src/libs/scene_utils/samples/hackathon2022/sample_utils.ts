// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. 2022
// SPDX-License-Identifier: Apache-2.0

import { readdirSync, readFileSync } from 'fs';
import minimist from 'minimist';
import { ModelRefNode } from '../../node/model.ts/model_ref';
import { withTrailingSlash } from '../../utils/file_utils';
import { ModelType } from '../../utils/types';
import * as path from 'path';

export interface CookieFactorySampleArguments {
  workspaceId: string;
  sceneId: string;
  assetDir: string;
  buildingJson: string;
}

export const help = () => {
  console.log(`Configure the AWS credentials and AWS region in your environment by setting env variables:
    * AWS_ACCESS_KEY_ID
    * AWS_SECRET_ACCESS_KEY
    * AWS_SESSION_TOKEN
    * AWS_REGION (e.g. us-east-1)
  
  Usage: 
    
    arguments:
      --workspaceId         REQUIRED
      --sceneId             REQUIRED
      --assetDir            REQUIRED
      --buildingJson    REQUIRED            
    
    CookieFactory sample:
      npx ts-node city_sample1.ts --workspaceId CookieFactory --sceneId FactoryScene --assetDir [ASSET_PATH] --buildingDataJSON [BUILDING_JSON_PATH]
    `);
};

// Parses command-line arguments for the sample files to extract the supported settings.
export const parseArgs = (): CookieFactorySampleArguments => {
  const args: CookieFactorySampleArguments = {
    workspaceId: '',
    sceneId: '',
    assetDir: '',
    buildingJson: '',
  };
  const parsedArgs = minimist(process.argv.slice(2));
  for (const arg of Object.keys(parsedArgs)) {
    switch (arg) {
      case 'h':
      case 'help':
        help();
        process.exit(0);
      case 'workspaceId':
        args.workspaceId = parsedArgs[arg];
        break;
      case 'sceneId':
        args.sceneId = parsedArgs[arg];
        break;
      case 'assetDir':
        const assetDir = parsedArgs[arg] as string;
        args.assetDir = withTrailingSlash(assetDir);
        break;
      case 'buildingJson':
        args.buildingJson = parsedArgs[arg];
        break;
      case '_':
        break;
      default:
        console.error(`unknown arg "--${arg}"`);
        help();
        process.exit(1);
    }
  }

  if (args.workspaceId === '' || args.sceneId === '' || args.assetDir === '' || args.buildingJson === '') {
    help();
    process.exit(1);
  }
  return args;
};

// Convert 3D file to a ModelRef object
export const assetToModelRef = (assetPath: string, nodeName?: string): ModelRefNode => {
  const fileParse = path.parse(assetPath);
  return new ModelRefNode(nodeName ?? fileParse.name, fileParse.base, fileParse.ext.slice(1).toUpperCase() as ModelType);
};

// Parse Building JSON
type BuildingData = {
  BuildIndex: number;
  BufferIndex: number;
  MeshFilename: string;
  PositionX: number;
  PositionY: number;
  PositionZ: number;
  Angle: number;
  Problems: string;
  CitizenUnits: any;
};

// Load bulk transforms of assets from a CSV
export const parseJSON = (filePath: string): BuildingData[] => {
  const fileJSON = readFileSync(filePath, { encoding: 'utf-8' });

  return JSON.parse(fileJSON) as BuildingData[];
};

// Set transform of a Building asset
export const processBuildingTransforms = (assetDir: string, content: BuildingData[]): ModelRefNode[] => {
  const files: string[] = readdirSync(assetDir);

  // Used to get the GLTF or GLB file that was converted from the source OBJ
  const fileNameMap = {};
  for (const fileName of files) {
    const name = path.parse(fileName).name;
    fileNameMap[name] = fileName;
  }

  const nodes: ModelRefNode[] = [];
  for (const row of content) {
    const fileName = path.parse(row.MeshFilename).name;
    const glFileName = fileNameMap[fileName];
    const buildingAssetFile = `${assetDir}${glFileName}`;
    const buildingRefNode: ModelRefNode = assetToModelRef(buildingAssetFile);
    buildingRefNode.withCastShadow(true).withReceiveShadow(true);
    buildingRefNode.uploadModelFromLocalIfNotExist(buildingAssetFile);

    buildingRefNode
      .withPosition({ x: row.PositionX, y: row.PositionY, z: row.PositionZ })
      .withRotation({ x: 0, y: 0, z: 0})
      .withScale({ x: 1, y: 1, z: 1 });

    nodes.push(buildingRefNode);
  }

  return nodes;
};
