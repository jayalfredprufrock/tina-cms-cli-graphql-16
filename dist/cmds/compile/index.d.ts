/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import type { TinaCloudSchema } from '@tinacms/graphql';
export declare const resetGeneratedFolder: ({ tinaGeneratedPath, usingTs, isBuild, }: {
    tinaGeneratedPath: string;
    usingTs: boolean;
    isBuild: boolean;
}) => Promise<void>;
export declare const compileFile: (options: {
    schemaFileType?: string;
    verbose?: boolean;
    dev?: boolean;
    rootPath: string;
}, fileName: string) => Promise<{}>;
export declare const compileSchema: (options: {
    schemaFileType?: string;
    verbose?: boolean;
    dev?: boolean;
    rootPath: string;
}) => Promise<any>;
export declare const defineSchema: (config: TinaCloudSchema) => TinaCloudSchema;
