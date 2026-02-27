import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MongoHacks Platform',
  tagline: 'Build and run amazing hackathons powered by MongoDB',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://mongohacks-docs.mongodb.com',
  baseUrl: '/',

  organizationName: 'mongodb',
  projectName: 'mongohacks-platform',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/mongodb/mongohacks-platform/tree/main/docs',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/mongodb/mongohacks-platform/tree/main/docs',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/mongohacks-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    algolia: {
      // Algolia DocSearch configuration
      appId: 'YOUR_APP_ID', // Replace with actual Algolia app ID
      apiKey: 'YOUR_SEARCH_API_KEY', // Public search-only API key
      indexName: 'mongohacks-docs',
      
      // Custom search parameters for prioritization
      searchParameters: {
        facetFilters: [],
        // Custom ranking to prioritize UI docs over API docs
        optionalFilters: [
          'docusaurus_tag:docs<score=10>', // Boost main docs
          'docusaurus_tag:admin<score=15>', // Boost admin guides highest
          'docusaurus_tag:features<score=12>', // Boost feature docs
          'docusaurus_tag:getting-started<score=14>', // Boost getting started
          'docusaurus_tag:ai<score=11>', // Boost AI feature docs
          'docusaurus_tag:api<score=3>', // Lower API docs unless explicitly searched
        ],
      },
      
      // Context search - only search API docs when "api" is in query
      contextualSearch: true,
      searchPagePath: 'search',
      insights: true,
    },
    navbar: {
      title: 'MongoHacks',
      logo: {
        alt: 'MongoHacks Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API Reference',
        },
        {to: '/blog', label: 'Release Notes', position: 'left'},
        {
          href: 'https://github.com/mongodb/mongohacks-platform',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Installation',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'Configuration',
              to: '/docs/getting-started/configuration',
            },
          ],
        },
        {
          title: 'Features',
          items: [
            {
              label: 'Event Management',
              to: '/docs/features/event-management',
            },
            {
              label: 'AI Features',
              to: '/docs/ai/overview',
            },
            {
              label: 'Judging System',
              to: '/docs/features/judging',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Release Notes',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/mongodb/mongohacks-platform',
            },
            {
              label: 'MongoDB',
              href: 'https://www.mongodb.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MongoDB, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
