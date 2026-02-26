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
              to: '/docs/installation',
            },
            {
              label: 'Configuration',
              to: '/docs/configuration',
            },
          ],
        },
        {
          title: 'Features',
          items: [
            {
              label: 'Event Management',
              to: '/docs/features/events',
            },
            {
              label: 'AI Features',
              to: '/docs/features/ai',
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
