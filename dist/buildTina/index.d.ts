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
import { Database } from '@tinacms/graphql';
import { DocumentNode } from 'graphql';
interface ClientGenOptions {
    noSDK?: boolean;
    local?: boolean;
    verbose?: boolean;
    port?: number;
}
interface BuildOptions {
    local: boolean;
    dev?: boolean;
    verbose?: boolean;
    rootPath?: string;
}
interface BuildSetupOptions {
    isomorphicGitBridge?: boolean;
    experimentalData?: boolean;
}
export declare const buildSetupCmdBuild: (ctx: any, next: () => void, opts: BuildSetupOptions) => Promise<void>;
export declare const buildSetupCmdServerStart: (ctx: any, next: () => void, opts: BuildSetupOptions) => Promise<void>;
export declare const buildSetupCmdAudit: (ctx: any, next: () => void, options: {
    clean: boolean;
}) => Promise<void>;
export declare const buildCmdBuild: (ctx: {
    builder: ConfigBuilder;
    rootPath: string;
    usingTs: boolean;
    schema: unknown;
    apiUrl: string;
}, next: () => void, options: Omit<BuildOptions & BuildSetupOptions & ClientGenOptions, 'bridge' | 'database' | 'store'>) => Promise<void>;
export declare const auditCmdBuild: (ctx: {
    builder: ConfigBuilder;
    rootPath: string;
    database: Database;
}, next: () => void, options: Omit<BuildOptions & BuildSetupOptions, 'bridge' | 'database' | 'store'>) => Promise<void>;
export declare class ConfigBuilder {
    private database;
    constructor(database: Database);
    build({ dev, verbose, rootPath, local }: BuildOptions): Promise<{
        schema: any;
        graphQLSchema: DocumentNode;
        tinaSchema: any;
    }>;
    genTypedClient({ usingTs, compiledSchema, noSDK, verbose, local, port, }: ClientGenOptions & {
        usingTs: boolean;
        compiledSchema: any;
    }): Promise<string>;
}
export declare const buildAdmin: ({ schema, local, rootPath, apiUrl, }: {
    schema: any;
    local: boolean;
    rootPath: string;
    apiUrl: string;
}) => Promise<void>;
export {};
