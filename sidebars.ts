import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/configuration',
        'getting-started/first-event',
      ],
    },
    {
      type: 'category',
      label: 'Core Features',
      items: [
        'features/event-management',
        'features/event-hub',
        'features/registration',
        'features/teams',
        'features/projects',
        'features/judging',
        'features/results',
      ],
    },
    {
      type: 'category',
      label: 'AI Features',
      items: [
        'ai/overview',
        'ai/project-summaries',
        'ai/feedback-synthesis',
        'ai/team-matching',
        'ai/vector-search',
      ],
    },
    {
      type: 'category',
      label: 'Administration',
      items: [
        'admin/dashboard',
        'admin/users',
        'admin/events',
        'admin/judges',
        'admin/partners',
        'admin/analytics',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/architecture',
        'development/database',
        'development/api-routes',
        'development/testing',
        'development/deployment',
      ],
    },
  ],
  api: [
    'api/overview',
    {
      type: 'category',
      label: 'Events API',
      items: [
        'api/events/create',
        'api/events/register',
        'api/events/teams',
        'api/events/projects',
      ],
    },
    {
      type: 'category',
      label: 'Judging API',
      items: [
        'api/judging/assignments',
        'api/judging/scoring',
        'api/judging/results',
      ],
    },
    {
      type: 'category',
      label: 'AI API',
      items: [
        'api/ai/summaries',
        'api/ai/feedback',
        'api/ai/matching',
      ],
    },
  ],
};

export default sidebars;
