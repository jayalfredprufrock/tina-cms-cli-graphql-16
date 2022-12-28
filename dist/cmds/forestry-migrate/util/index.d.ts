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
import z from 'zod';
import type { TinaFieldInner } from '@tinacms/schema-tools';
declare const forestryFieldWithoutField: z.ZodObject<{
    type: z.ZodUnion<[z.ZodLiteral<"text">, z.ZodLiteral<"datetime">, z.ZodLiteral<"list">, z.ZodLiteral<"file">, z.ZodLiteral<"image_gallery">, z.ZodLiteral<"textarea">, z.ZodLiteral<"tag_list">, z.ZodLiteral<"number">, z.ZodLiteral<"boolean">, z.ZodLiteral<"field_group">, z.ZodLiteral<"field_group_list">, z.ZodLiteral<"select">, z.ZodLiteral<"include">, z.ZodLiteral<"blocks">, z.ZodLiteral<"color">]>;
    name: z.ZodString;
    label: z.ZodString;
    default: z.ZodOptional<z.ZodAny>;
    config: z.ZodOptional<z.ZodObject<{
        required: z.ZodOptional<z.ZodBoolean>;
        use_select: z.ZodOptional<z.ZodBoolean>;
        date_format: z.ZodOptional<z.ZodString>;
        time_format: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        source: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"custom">, z.ZodLiteral<"pages">, z.ZodLiteral<"documents">, z.ZodLiteral<"simple">, z.ZodString]>>;
            section: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type?: string;
            section?: string;
        }, {
            type?: string;
            section?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        required?: boolean;
        options?: string[];
        use_select?: boolean;
        date_format?: string;
        time_format?: string;
        source?: {
            type?: string;
            section?: string;
        };
    }, {
        required?: boolean;
        options?: string[];
        use_select?: boolean;
        date_format?: string;
        time_format?: string;
        source?: {
            type?: string;
            section?: string;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    default?: any;
    label?: string;
    config?: {
        required?: boolean;
        options?: string[];
        use_select?: boolean;
        date_format?: string;
        time_format?: string;
        source?: {
            type?: string;
            section?: string;
        };
    };
    name?: string;
    type?: "number" | "boolean" | "file" | "datetime" | "text" | "list" | "select" | "image_gallery" | "textarea" | "tag_list" | "field_group" | "field_group_list" | "include" | "blocks" | "color";
}, {
    default?: any;
    label?: string;
    config?: {
        required?: boolean;
        options?: string[];
        use_select?: boolean;
        date_format?: string;
        time_format?: string;
        source?: {
            type?: string;
            section?: string;
        };
    };
    name?: string;
    type?: "number" | "boolean" | "file" | "datetime" | "text" | "list" | "select" | "image_gallery" | "textarea" | "tag_list" | "field_group" | "field_group_list" | "include" | "blocks" | "color";
}>;
declare type ForestryFieldWithoutFieldType = z.infer<typeof forestryFieldWithoutField>;
interface ForestryFieldType extends ForestryFieldWithoutFieldType {
    fields?: ForestryFieldType[];
}
declare const FrontmatterTemplateSchema: z.ZodObject<{
    label: z.ZodString;
    hide_body: z.ZodOptional<z.ZodBoolean>;
    fields: z.ZodOptional<z.ZodArray<z.ZodType<ForestryFieldType, z.ZodTypeDef, ForestryFieldType>, "many">>;
}, "strip", z.ZodTypeAny, {
    label?: string;
    fields?: ForestryFieldType[];
    hide_body?: boolean;
}, {
    label?: string;
    fields?: ForestryFieldType[];
    hide_body?: boolean;
}>;
export declare const transformForestryFieldsToTinaFields: ({ fields, collection, }: {
    fields: z.infer<typeof FrontmatterTemplateSchema>['fields'];
    collection: string;
}) => TinaFieldInner<false>[];
export declare const getFieldsFromTemplates: ({ tem, rootPath, collection, }: {
    tem: string;
    collection: string;
    rootPath: string;
}) => TinaFieldInner<false>[];
export declare const parseTemplates: ({ val }: {
    val: unknown;
}) => {
    label?: string;
    fields?: ForestryFieldType[];
    hide_body?: boolean;
};
export declare const hasForestryConfig: ({ rootPath }: {
    rootPath: string;
}) => Promise<{
    path: string;
    exists: boolean;
}>;
export declare const parseSections: ({ val }: {
    val: unknown;
}) => {
    sections?: {
        label?: string;
        path?: string;
        type?: "directory" | "document" | "heading" | "jekyll-pages" | "jekyll-posts";
        match?: string;
        exclude?: string;
        create?: "documents" | "all" | "none";
        templates?: string[];
        new_doc_ext?: string;
        read_only?: boolean;
    }[];
};
export {};
