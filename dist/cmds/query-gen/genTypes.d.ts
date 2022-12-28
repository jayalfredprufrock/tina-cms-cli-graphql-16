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
import { GraphQLSchema } from 'graphql';
import { TinaCloudSchema } from '@tinacms/schema-tools';
export declare const TINA_HOST = "content.tinajs.io";
export declare function genClient({ tinaSchema, usingTs, }: {
    tinaSchema: TinaCloudSchema<false>;
    usingTs?: boolean;
}, options: any): Promise<string>;
export declare function genTypes({ schema, usingTs }: {
    schema: GraphQLSchema;
    usingTs?: boolean;
}, next: () => void, options: any): Promise<void>;
