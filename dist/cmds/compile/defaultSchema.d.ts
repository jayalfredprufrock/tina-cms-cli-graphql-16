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
export declare const defaultSchema = "\nimport { defineSchema, defineConfig } from 'tinacms'\nimport { client } from './__generated__/client'\n\n\nconst branch =\n  process.env.NEXT_PUBLIC_TINA_BRANCH ||\n  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||\n  process.env.HEAD ||\n  'main'\nconst schema = defineSchema({\n  // See https://tina.io/docs/tina-cloud/connecting-site/ for more information about this config\n  config: {\n    token: '<Your Read Only Token>', // generated on app.tina.io,\n    clientId: '<Your Client ID>', // generated on app.tina.io\n    branch,\n  },\n  collections: [\n    {\n      label: 'Blog Posts',\n      name: 'post',\n      path: 'content/posts',\n      format: 'mdx',\n      ui: {\n        router: ({ document }) => {\n          // This can be used to add contextual editing to your site. See https://tina.io/docs/tinacms-context/#accessing-contextual-editing-from-the-cms for more information.\n          return `/demo/blog/${document._sys.filename}`\n        },\n      },\n      fields: [\n        {\n          type: 'string',\n          label: 'Title',\n          name: 'title',\n        },\n        {\n          type: 'rich-text',\n          label: 'Blog Post Body',\n          name: 'body',\n          isBody: true,\n          templates: [\n            {\n              name: 'PageSection',\n              label: 'Page Section',\n              fields: [\n                {\n                  type: 'string',\n                  name: 'heading',\n                  label: 'Heading',\n                },\n                {\n                  type: 'string',\n                  name: 'content',\n                  label: 'Content',\n                  ui: {\n                    component: 'textarea',\n                  },\n                },\n              ],\n            },\n          ],\n        },\n      ],\n    },\n  ],\n})\n\nexport default schema\n\n// Your tina config\n\nexport const tinaConfig = defineConfig({\n  client,\n  schema,\n})\n\n";
