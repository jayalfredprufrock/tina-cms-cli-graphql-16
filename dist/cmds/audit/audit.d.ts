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
import type { Database, TinaCloudCollection } from '@tinacms/graphql';
declare type AuditArgs = {
    collection: TinaCloudCollection;
    database: Database;
    rootPath: string;
    documents: {
        node: {
            path: string;
        };
    }[];
    useDefaultValues: boolean;
    verbose?: boolean;
};
export declare const auditCollection: (args: AuditArgs) => Promise<boolean>;
export declare const auditDocuments: (args: AuditArgs) => Promise<boolean>;
export declare const transformDocumentIntoMutationRequestPayload: (document: {
    [key: string]: unknown;
    _collection: string;
    __typename?: string;
    _template: string;
}, instructions: {
    includeCollection?: boolean;
    includeTemplate?: boolean;
}, defaults?: any) => any;
export {};
